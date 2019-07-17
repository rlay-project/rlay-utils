const simple = require('simple-mock');
const { Client } = require('../../src/client');
const { cids, schema } = require('../assets');

const mockClient = new Client();
mockClient.initSchema(cids, schema);
mockClient.initClient();

simple.mock(mockClient, 'createEntity').callFn(
  async (payload) => {
    if (payload.type === 'CONNECTION_ERROR') return Promise.reject(new Error('failure'))
    return Promise.resolve('0x0000')
  }
);

simple.mock(mockClient, 'findEntityByCID').callFn(
  async (cid) => {
    if (cid === 'CID_CONNECTION_ERROR') return Promise.reject(new Error('failure'))
    if (cid === 'CID_NOT_FOUND') return Promise.resolve(null)
    return Promise.resolve({type: 'TestEntity'})
  }
);

module.exports = mockClient;
