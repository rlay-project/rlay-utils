const Web3 = require('web3');
const { ClientInterface } = require('./interfaces/client');
const pLimit = require('p-limit');
const rlay = require('@rlay/web3-rlay');
const RlayEntities = require('./rlay');
const EntityMetaFactory = require('./entityMetaFactory');
const RlayOntology = require('@rlay/ontology');
const { SchemaPayload } = require('./schemaPayload');
const { Payload } = require('./payload');
const { Negative } = require('./negative');
const { mix } = require('mixwith');
const check = require('check-types');

class Config {
  constructor() {
    this.address = '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13';
    this.backend = 'myneo4j';
    this.RpcUrl = process.env.RPC_URL || 'http://localhost:8546';
    this.storeLimit = 50;
    this.readLimit = 50;
    this.kafka = undefined;
    Object.seal(this);
  }
}

/**
 * The `Client`, ORM, and main interface for users
 */
class ClientBase extends mix(EntityMetaFactory).with(ClientInterface) {

  /**
   * Create a new Client instance
   *
   * @param {Config} config - The configuration for the client
   */
  constructor (config = {}) {
    super();
    this.config = new Config();
    this.initConfig(config);

    this.kafka = this.config.kafka;
    this.web3 = new Web3(this.config.RpcUrl);
    rlay.extendWeb3WithRlay(this.web3);
    this.web3.eth.defaultAccount = this.config.address;

    this.rlay = rlay;
    this.rlayOntology = RlayOntology;
    this.SchemaPayload = SchemaPayload;
    this.Payload = Payload;
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
      const promises = [this.rlay.store(this.web3, entity, { backend: this.config.backend })]
      if (this.kafka) {
        const _entity = this.getEntityFromPayload(entity);
        promises[1] = this.kafka.producer.send({
          topic: this.kafka.topicName,
          messages: [{ key: _entity.cid, value: JSON.stringify(_entity.payload) }]
        });
      }
      return Promise.all(promises).then(results => results[0]);
    })
  }

  async createEntities (entities) {
    return this.storeLimit(async () => {
      const promises = [
        this.rlay.storeEntities(this.web3, entities, { backend: this.config.backend })];
      if (this.kafka) {
        promises[1] = this.kafka.producer.send({
          topic: this.kafka.topicName,
          messages: entities.map(entity => {
            const _entity = this.getEntityFromPayload(entity);
            return { key: _entity.cid, value: JSON.stringify(_entity.payload) };
          })
        });
      }
      return Promise.all(promises).then(results => results[0]);
    });
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
    if (config.kafka) {
      if (!check.string(config.kafka.topicName) ||
        !check.object(config.kafka.producer)) {
        throw new Error('invalid kafka config: expected topicName to be string and producer to be an object');
      }
    }
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
    Object.keys(schemaCIDs).forEach(key => {
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

module.exports = { ClientBase, Config };
