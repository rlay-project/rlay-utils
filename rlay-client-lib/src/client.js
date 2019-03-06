const Web3 = require('web3');
const pLimit = require('p-limit');
const rlay = require('@rlay/web3-rlay');

class Config {
  constructor() {
    this.address = '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13';
    this.backed = 'myneo4j';
    this.RpcUrl = process.env.RPC_URL || 'http://localhost:8546';
    this.storeLimit = pLimit(50);
    Object.seal(this);
  }
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const generateFnName = (string) => {
  if (string.endsWith('Class')) return capitalizeFirstLetter(string.slice(0, -5));
  if (string.endsWith('DataProperty')) return capitalizeFirstLetter(string.slice(0, -12));
  if (string.endsWith('ObjectProperty')) return capitalizeFirstLetter(string.slice(0, -14));
  return string;
}

class Client {
  constructor (config={}) {
    this.config = new Config();
    this.initConfig(config);

    this.web3 = new Web3(this.config.RpcUrl);
    rlay.extendWeb3OldWithRlay(this.web3);
    this.web3.eth.defaultAccount = this.config.address;

    this.rlay = rlay;
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

  initSchema (name, payload) {
    if (payload.type === 'Class') {
      this[`prepare${generateFnName(name)}`] = (subject) => {
        return {
          type: 'ClassAssertion',
          subject: subject || '0x00',
          class: this[`${name}`],
        };
      }
      this[`assert${generateFnName(name)}`] = async (subject) => {
        return this.createEntity(this[`prepare${generateFnName(name)}`](subject))
      }
    }

    if (payload.type === 'DataProperty') {
      this[`prepare${generateFnName(name)}`] = (subject, target) => {
        return {
          type: 'DataPropertyAssertion',
          subject: subject,
          property: this[`${name}`],
          target: this.rlay.encodeValue(target),
        };
      }
      this[`assert${generateFnName(name)}`] = async (subject, target) => {
        return this.createEntity(this[`prepare${generateFnName(name)}`](subject, target))
      }
    }

    if (payload.type === 'ObjectProperty') {
      this[`prepare${generateFnName(name)}`] = (subject, target) => {
        return {
          type: 'ObjectPropertyAssertion',
          subject: subject,
          property: this[`${name}`],
          target: target,
        };
      }
      this[`assert${generateFnName(name)}`] = async (subject, target) => {
        return this.createEntity(this[`prepare${generateFnName(name)}`](subject, target))
      }
    }
  }
}

module.exports = { Client, Config };
