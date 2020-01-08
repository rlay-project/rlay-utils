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
const { ClientConfig } = require('./clientConfig');
const { wrapDebug } = require('./utils.js');
const debug = require('./debug');

/**
 * The `Client`, ORM, and main interface for users
 */
class ClientBase extends mix(EntityMetaFactory).with(ClientInterface) {

  /**
   * Create a new Client instance
   *
   * @param {ClientConfig} config - The configuration for the client
   */
  constructor (config = {}) {
    super();
    this.config = new ClientConfig();
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
    const thisDebug = debug.extend('createEntity');
    const debugFnRlay = (debugObject) => {
      thisDebug.extend('performance').extend('rlay')(`${Date.now() - debugObject.startTimestamp}ms`)
    }
    const debugFnKafka = (debugObject) => {
      thisDebug.extend('performance').extend('kafka')(`${Date.now() - debugObject.startTimestamp}ms`)
    }

    return this.storeLimit(async () => {
      const rlayStoreEntityPromise = this.rlay.store(this.web3, entity, { backend: this.config.backend })
      const promises = [wrapDebug(rlayStoreEntityPromise, debugFnRlay)];
      if (this.kafka) {
        const entityObject = this.getEntityFromPayload(entity);
        const kafkaStoreEntityPromise = this.kafka.producer.send({
          topic: this.kafka.topicName,
          messages: [{ key: entityObject.cid, value: JSON.stringify(entityObject.payload) }]
        });
        promises[1] = wrapDebug(kafkaStoreEntityPromise, debugFnKafka);
      }
      return Promise.all(promises).then(results => results[0]);
    })
  }

  async createEntities (entities) {
    const thisDebug = debug.extend('createEntities');
    thisDebug.extend('entities')(entities.length);

    const debugFnRlay = (debugObject) => {
      thisDebug.extend('performance').extend('rlay')(`${Date.now() - debugObject.startTimestamp}ms`)
    }

    const debugFnKafka = (debugObject) => {
      thisDebug.extend('performance').extend('kafka')(`${Date.now() - debugObject.startTimestamp}ms`)
    }

    return this.storeLimit(async () => {
      const rlayStoreEntitiesPromise = this.rlay.
        storeEntities(this.web3, entities, { backend: this.config.backend });
      const promises = [wrapDebug(rlayStoreEntitiesPromise, debugFnRlay)];
      if (this.kafka) {
        const kafkaStoreEntitiesPromise = this.kafka.producer.send({
          topic: this.kafka.topicName,
          messages: entities.map(entity => {
            const entityObject = this.getEntityFromPayload(entity);
            return { key: entityObject.cid, value: JSON.stringify(entityObject.payload) };
          })
        });
        promises[1] = wrapDebug(kafkaStoreEntitiesPromise, debugFnKafka);
      }
      return Promise.all(promises).then(results => results[0]);
    });
  }

  async findEntityByCID (cid) {
    return this.readLimit(async () => {
      return this.web3.rlay.experimentalGetEntity(cid, { backend: this.config.backend });
    });
  }

  async findEntityByCIDs (cids) {
    return this.readLimit(async () => {
      return this.web3.rlay.experimentalGetEntities(cids, { backend: this.config.backend });
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

module.exports = { ClientBase };
