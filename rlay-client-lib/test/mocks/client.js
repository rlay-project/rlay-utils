const simple = require('simple-mock');
const payloads = require('../assets/payloads');
const mockClient = require('../seed/generated/rlay-client');
const VError = require('verror');
const cloneDeep = require('lodash.clonedeep');

const clone = obj => JSON.parse(JSON.stringify(obj))

const validateInputCid = cid => {
  const options = [
    'CID_EXISTS',
    'CID_NOT_FOUND',
    'CID_CONNECTION_ERROR',
    ...Object.keys(payloads)
  ];
  if (!options.includes(cid)) {
    const invalidCidError = new Error(`invalid cid ${cid}`);
    const validOptions = new VError(invalidCidError, `valid options: ${options}`);
    throw new VError(validOptions, 'failed .findEntityByCID [MOCK]')
  }
}

const mockCreateEntity = mockClient => {
  simple.mock(mockClient, 'createEntity').callFn(
    async (payload) => {
      if (payload.type === 'CONNECTION_ERROR') return Promise.reject(new Error('failure'))
      try {
        return Promise.resolve(mockClient.getEntityCid(payload))
      } catch (e) {
        return Promise.resolve('0x0000')
      }
    }
  );
}

const mockFindEntity = mockClient => {
  simple.mock(mockClient, 'findEntityByCID').callFn(async cid => {
    validateInputCid(cid);
    if (cid === 'CID_EXISTS') return Promise.resolve(clone(payloads.withCid))
    if (cid === 'CID_CONNECTION_ERROR') return Promise.reject(new Error('failure'))
    if (cid === 'CID_NOT_FOUND') return Promise.resolve(null)
    return Promise.resolve(payloads[cid])
  });

  simple.mock(mockClient, 'findEntityByCypher').callFn(async query => {
    return Promise.resolve([{type: 'Class', cid: '0x01'}, {type: 'Class', cid: '0x02'}]);
  });
}

module.exports = {
  mockClient,
  mockCreateEntity,
  mockFindEntity
};
