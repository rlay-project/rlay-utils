const assert = require('assert');
const simple = require('simple-mock');
const { Rlay_Individual, Entity } = require('../src/rlay');
const { Client } = require('../src/client');
const { cids, schema } = require('./assets');
const { UnknownEntityError } = require('../src/errors');

let client;
const testObj = Rlay_Individual;
const testObjType = 'Individual';

describe('Rlay_Individual', () => {

  beforeEach(() => {
    client = new Client();
    client.initSchema(cids, schema);
    client.initClient();
  })

  beforeEach(() => {
    // mock it
    simple.mock(client, 'createEntity').callFn(
      async (entity) => Promise.resolve('0x0000')
    );
  });

  it('should inherit `Entity`', () => {
    assert.equal(testObj.prototype instanceof Entity, true);
  });

  it('should have its properties correctly defined', () => {
    assert.equal(testObj.client instanceof Client, true);
    assert.equal(testObj.fields instanceof Array, true);
    assert.equal(testObj.fieldsDefault, undefined);
    assert.equal(testObj.type, testObjType);
  });

  describe('static .create', () => {

    const payload = {
      httpConnectionClass: true,
      httpEntityHeaderClass: true
    };
    let result;
    let callArg;

    beforeEach(async () => {
      result = await testObj.create(payload);
      callArg = client.createEntity.lastCall.arg;
    });

    it('should call `client.createEntity` to create the Entity', async () => {
      assert.equal(client.createEntity.callCount, 3);
    });

    it('should call `client.createEntity` with the correct payload', async () => {
      const target = JSON.stringify({
        class_assertions: ['0x0000', '0x0000'],
        type: testObjType
      });
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
        const target = JSON.stringify({ type: testObjType });
        assert.equal(JSON.stringify(callArg), target);
      })

    });

    context('with wrong params', () => {

      beforeEach(async () => {
        result = await testObj.create({doesNotExist: '123'});
        callArg = client.createEntity.lastCall.arg;
      });

      it('should use base defaults', async () => {
        const target = JSON.stringify({ type: testObjType });
        assert.equal(JSON.stringify(callArg), target);
      });

    });

  });

  describe('.assert', () => {

    const payload = {
      httpConnectionClass: true,
      httpEntityHeaderClass: true
    };
    let instance;
    let result;
    let callArg;

    beforeEach(async () => {
      instance = await testObj.create();
      result = await instance.assert(payload);
      callArg = client.createEntity.lastCall.arg;
    });

    it('should call `client.createEntity` to create the `Assertion`(s)', async () => {
      assert.equal(client.createEntity.callCount, 3);
    });

    it('have `Individual.cid` as `subject` for `Assertion`(s)', async () => {
      assert.equal(callArg.subject, instance.cid);
    });

  });

});
