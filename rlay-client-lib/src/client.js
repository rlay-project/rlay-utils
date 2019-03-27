const Web3 = require('web3');
const pLimit = require('p-limit');
const rlay = require('@rlay/web3-rlay');
const { generateFnName } = require('./utils');

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
  }

  async createEntity (entity) {
    return this.storeLimit(async () => {
      return this.rlay.store(this.web3, entity, { backend: this.config.backend });
    })
  }

  async createIndividual (params) {
    return this.createEntity(this.prepareIndividual(params));
  }

  prepareIndividual (params) {
    return Object.assign(params, { type: 'Individual', });
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
        this.schema[assertion.key] = Object.assign(this.schema[assertion.key], assertion.assertion);
      }
    });
  }

  initClient () {
    Object.keys(this.schema).forEach(key => {
      const schemaObj = this.schema[key];

      if (schemaObj.type === 'Class') {
        this[`prepare${generateFnName(key)}`] = (subject) => {
          return {
            type: 'ClassAssertion',
            subject: subject || '0x00',
            class: schemaObj.cid,
          };
        }
        this[`assert${generateFnName(key)}`] = async (subject) => {
          return this.createEntity(this[`prepare${generateFnName(key)}`](subject))
        }
      }

      if (schemaObj.type === 'DataProperty') {
        this[`prepare${generateFnName(key)}`] = (subject, target) => {
          return {
            type: 'DataPropertyAssertion',
            subject: subject || '0x00',
            property: schemaObj.cid,
            target: this.rlay.encodeValue(target),
          };
        }
        this[`assert${generateFnName(key)}`] = async (subject, target) => {
          return this.createEntity(this[`prepare${generateFnName(key)}`](subject, target))
        }
      }

      if (schemaObj.type === 'ObjectProperty') {
        this[`prepare${generateFnName(key)}`] = (subject, target) => {
          return {
            type: 'ObjectPropertyAssertion',
            subject: subject || '0x00',
            property: schemaObj.cid,
            target: target,
          };
        }
        this[`assert${generateFnName(key)}`] = async (subject, target) => {
          return this.createEntity(this[`prepare${generateFnName(key)}`](subject, target))
        }
      }
    });
  }
}

module.exports = { Client, Config };
