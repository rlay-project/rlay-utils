const assert = require('assert');
const simple = require('simple-mock');
const { Rlay_ClassAssertion, Entity } = require('../src/rlay');
const { Client } = require('../src/client');
const { cids, schema } = require('./assets');
const { UnknownEntityError } = require('../src/errors');

let client;
const testObj = Rlay_ClassAssertion;
const testObjType = 'ClassAssertion';
const defaultPayload = {
  annotations: [],
  subject: '0x00',
  type: testObjType,
};

describe('Rlay_ClassAssertion', () => {

  beforeEach(() => {
    client = new Client();
    client.initSchema(cids, schema);
    client.initClient();
  })

  beforeEach(() => {
    // mock it
    simple.mock(client, 'createEntity').callFn(
      async () => Promise.resolve('0x0000')
    );
    simple.mock(client, 'findEntityByCID').callFn(
      async () => Promise.resolve('0x0000')
    );
  });

  it('should inherit `Entity`', () => {
    assert.equal(testObj.prototype instanceof Entity, true);
  });

  it('should have `.client` defined', () => {
    assert.equal(testObj.client instanceof Client, true);
  });

  describe('static .create', () => {

    const targetValue = 'test';
    const payload = {
      property: '0x01',
      target: targetValue
    };
    let result;
    let callArg;

    beforeEach(async () => {
      result = await testObj.create(payload);
      callArg = client.createEntity.lastCall.arg;
    });

    it('should call `client.createEntity` to create the Entity', async () => {
      assert.equal(client.createEntity.callCount, 1);
    });

    it('should call `client.createEntity` with the correct payload', async () => {
      const target = JSON.stringify(defaultPayload);
      assert.equal(JSON.stringify(callArg), target);
    });

    it('should return an `Entity` instance', async () => {
      assert.equal(result instanceof testObj, true);
      assert.equal(result.client instanceof Client, true);
      assert.equal(result.payload instanceof Object, true);
      assert.equal(typeof result.cid, 'string');
    });

    context('without custom defaults', () => {

      beforeEach(async () => {
        result = await testObj.create();
        callArg = client.createEntity.lastCall.arg;
      });

      it ('should use base defaults', async () => {
        const target = JSON.stringify(defaultPayload);
        assert.equal(JSON.stringify(callArg), target);
      })

    });

    context('with wrong params', () => {

      beforeEach(async () => {
        result = await testObj.create({doesNotExist: '123'});
        callArg = client.createEntity.lastCall.arg;
      });

      it('should use base defaults', async () => {
        const target = JSON.stringify(defaultPayload);
        assert.equal(JSON.stringify(callArg), target);
      });

    });

  });

});
