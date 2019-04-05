const Web3 = require('web3');
const pLimit = require('p-limit');
const rlay = require('@rlay/web3-rlay');
const EntityMetaFactory = require('./entity/meta-factory');
const RlayEntities = require('./rlay');

class Config {
  constructor() {
    this.address = '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13';
    this.backed = 'myneo4j';
    this.RpcUrl = process.env.RPC_URL || 'http://localhost:8546';
    this.storeLimit = 50;
    Object.seal(this);
  }
}

class Client {
  constructor (config = {}) {
    this.config = new Config();
    this.initConfig(config);

    this.web3 = new Web3(this.config.RpcUrl);
    rlay.extendWeb3WithRlay(this.web3);
    this.web3.eth.defaultAccount = this.config.address;

    this.rlay = rlay;
    this.schema = {};
    this.storeLimit = pLimit(this.config.storeLimit);
    this.entityMetaFactory = new EntityMetaFactory(this);

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

  initConfig (config) {
    Object.assign(this.config, config);
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
        this.schema[assertion.key] = this.entityMetaFactory.fromType(
          this.schema[assertion.key].type,
          this.schema[assertion.key],
          this.schema[assertion.key].cid,
        );
      }
    });
  }

  initClient () {
    Object.keys(this.schema).forEach(key => {
      const schemaEntity = this.schema[key];
      try {
        this[key] = this.entityMetaFactory.fromSchema(schemaEntity);
      } catch (_) { }
    });
  }
}

module.exports = { Client, Config };
