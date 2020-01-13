const simple = require('simple-mock');
const sinon = require('sinon');
const payloads = require('../assets/payloads');
const mockClient = require('../seed/generated/rlay-client');
const VError = require('verror');

const clone = obj => JSON.parse(JSON.stringify(obj))

const validateInputCid = cid => {
  const options = [
    'CID_EXISTS',
    'CID_NOT_FOUND',
    'CID_CONNECTION_ERROR',
    payloads.withCid.cid,
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

const stubCreateEntity = client => {
  try {
    const clientCreateEntityStub = sinon.stub(client, 'createEntity');
    clientCreateEntityStub.callsFake(payload => {
      if (payload.type === 'CONNECTION_ERROR') return Promise.reject(new Error('failure'))
      try {
        return Promise.resolve(client.getEntityCid(payload))
      } catch (e) {
        return Promise.resolve('0x0000')
      }
    });
    return clientCreateEntityStub;
  } catch (e) {
    return client.createEntity
  }
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
    return Promise.resolve([
      {type: 'Class', cid: '0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'},
      {type: 'Class', cid: '0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'}
    ]);
  });
}

const stubFindEntityByCid = client => {
  try {
    const clientFindEntityByCIDStub = sinon.stub(client, 'findEntityByCID');
    clientFindEntityByCIDStub.callsFake(cid => {
      validateInputCid(cid);
      if (cid === 'CID_EXISTS') return Promise.resolve(clone(payloads.withCid))
      if (cid === 'CID_CONNECTION_ERROR') return Promise.reject(new Error('failure'))
      if (cid === 'CID_NOT_FOUND') return Promise.resolve(null)
      return Promise.resolve(payloads[cid])
    });

    return clientFindEntityByCIDStub;
  } catch (e) {
    return client.findEntityByCID
  }
}

const stubResolveEntity = client => {
  try {
    const stub = sinon.stub(client.web3.rlay, 'experimentalResolveEntity');
    stub.callsFake(cid => {
      //validateInputCid(cid);
      if (cid === 'CID_EXISTS') return Promise.resolve(clone(payloads.withCidResolve))
      if (cid === payloads.withCid.cid) return Promise.resolve(clone(payloads.withCidResolve))
      if (cid === 'CID_EXISTS') return Promise.resolve(clone(payloads.withCidResolve))
      if (cid === 'CID_CONNECTION_ERROR') return Promise.reject(new Error('failure'))
      if (cid === 'CID_NOT_FOUND') return Promise.resolve(null)
      const response = {};
      response[cid] = [payloads[cid] || clone(payloads.withCid)];
      return Promise.resolve(response);
    });

    return stub;
  } catch (e) {
    return client.web3.rlay.experimentalResolveEntity;
  }
}

const stubFindEntityByCypher = client => {
  try {
  const clientFindEntityByCypherStub = sinon.stub(client, 'findEntityByCypher');
  clientFindEntityByCypherStub.callsFake(() => {
    return Promise.resolve([
      {type: 'Class', cid: '0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'},
      {type: 'Class', cid: '0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'}
    ]);
  });

  return clientFindEntityByCypherStub;
  } catch (e) {
    return client.findEntityByCypher
  }
}

module.exports = {
  mockClient,
  mockCreateEntity,
  stubCreateEntity,
  stubFindEntityByCid,
  stubFindEntityByCypher,
  stubResolveEntity,
  mockFindEntity
};
