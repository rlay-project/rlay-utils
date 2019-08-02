const Web3 = require('web3');
const { ClientInterface } = require('./interfaces/client');
const pLimit = require('p-limit');
const rlay = require('@rlay/web3-rlay');
const RlayEntities = require('./rlay');
const EntityMetaFactory = require('./entityMetaFactory');
const RlayOntology = require('@rlay/ontology');
const { Negative } = require('./negative');
const { mix } = require('mixwith');

class Config {
  constructor() {
    this.address = '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13';
    this.backend = 'myneo4j';
    this.RpcUrl = process.env.RPC_URL || 'http://localhost:8546';
    this.storeLimit = 50;
    this.readLimit = 50;
    Object.seal(this);
  }
}

/**
 * The `Client`, ORM, and main interface for users
 */
class Client extends mix(EntityMetaFactory).with(ClientInterface) {

  /**
   * Create a new Client instance
   *
   * @param {Config} config - The configuration for the client
   */
  constructor (config = {}) {
    super();
    this.config = new Config();
    this.initConfig(config);

    this.web3 = new Web3(this.config.RpcUrl);
    rlay.extendWeb3WithRlay(this.web3);
    this.web3.eth.defaultAccount = this.config.address;

    this.rlay = rlay;
    this.rlayOntology = RlayOntology;
    this.schema = {};
    this.storeLimit = pLimit(this.config.storeLimit);
    this.readLimit = pLimit(this.config.readLimit);

    // set client for RlayEntities
    Object.keys(RlayEntities).forEach(entity => {
      RlayEntities[entity].client = this;
    });
    Object.assign(this, RlayEntities);
    this.Individual = this.Rlay_Individual;
  }

  async createEntity (entity) {
    return this.storeLimit(async () => {
      return this.rlay.store(this.web3, entity, { backend: this.config.backend });
    })
  }

  async findEntityByCID (cid) {
    return this.readLimit(async () => {
      return this.web3.rlay.experimentalGetEntity(cid, { backend: this.config.backend });
    });
  }

  async findEntityByCypher (query) {
    return this.readLimit(async () => {
      return this.web3.rlay.experimentalNeo4jQuery(query, { backend: 'myneo4j' });
    });
  }

  getEntityCid (payload) {
    return this.rlayOntology.getEntityCid(payload);
  }

  initConfig (config) {
    Object.assign(this.config, config);
  }

  // eslint-disable-next-line class-methods-use-this
  isNegative (value) {
    return value instanceof Negative
  }

  // eslint-disable-next-line class-methods-use-this
  negative (obj) {
    return new Negative(obj);
  }

  initSchema (schemaCIDs, schema) {
    this.schema = Object.assign(this.schema, schemaCIDs);
    // transform this.schema['abc'] = "0x00xx" to
    //           this.schema['abc'] = { cid: "0x00xx" }
    Object.keys(this.schema).forEach(key => {
      const cid = this.schema[key];
      this.schema[key] = { cid };
    });
    // add additional schema info from @param: `schema`
    schema.forEach(assertion => {
      if (this.schema[assertion.key]) {
        this.schema[assertion.key] = Object.assign(
          this.schema[assertion.key],
          assertion.assertion
        );
        // convert to proper Rlay Entity
        this.schema[assertion.key] = this.getEntityFromPayload(
          this.schema[assertion.key]
        );
      }
    });
  }

  initClient () {
    Object.keys(this.schema).forEach(key => {
      const schemaEntity = this.schema[key];
      try {
        this[key] = this.fromSchema(schemaEntity);
      } catch (_) { }
    });
  }
}

module.exports = { Client, Config };
