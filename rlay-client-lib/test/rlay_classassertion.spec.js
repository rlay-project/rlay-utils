const assert = require('assert');
const simple = require('simple-mock')
const { Rlay_ClassAssertion, Entity } = require('../src/rlay');
const { Client } = require('../src/client');
const { cids, schema} = require('./assets');
const { UnknownEntityError } = require('../src/errors');

let client;
const testObj = Rlay_ClassAssertion;
const testObjType = 'ClassAssertion';

describe('Rlay_ClassAssertion', () => {

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
    assert.equal(testObj.fieldsDefault instanceof Object, true);
    assert.equal(testObj.type, testObjType);
  });

  describe('.create', () => {

    it('should call `client.createEntity` to create the Entity', async () => {
      await testObj.create({
        httpConnectionClass: true,
        httpEntityHeaderClass: true
      });
      assert.equal(client.createEntity.callCount, 1);
    });

    it('should call `client.createEntity` with the correct payload', async () => {
      await testObj.create({subject: '123', class: '456'});
      const callArg = client.createEntity.calls[0].arg;
      assert.equal(callArg.type, 'ClassAssertion');
      assert.equal(callArg.class, '456');
      assert.equal(callArg.subject, '123');
    });

    it('should return an `Entity` instance', async () => {
      const result = await testObj.create({subject: '123', class: '456'});
      assert.equal(result instanceof testObj, true);
      assert.equal(result.client instanceof Client, true);
      assert.equal(result.payload instanceof Object, true);
      assert.equal(typeof result.cid, 'string');
    });

    context('without custom defaults', () => {

      it ('should use base defaults', async () => {
        await testObj.create();
        const callArg = client.createEntity.calls[0].arg;
        assert.equal(callArg.type, 'ClassAssertion');
        assert.equal(callArg.class, '');
        assert.equal(callArg.subject, '0x00');
      })

    });

    context('with custom defaults', () => {

      before(() => {
        testObj.fieldsDefault = { class: undefined, subject: 999 };
      });

      it('should call `client.createEntity` correct custom default field', async () => {
        await testObj.create({class: '456'});
        const callArg = client.createEntity.calls[0].arg;
        assert.equal(callArg.type, 'ClassAssertion');
        assert.equal(callArg.class, '456');
        assert.equal(callArg.subject, 999);
      });

      it('should allow custom default field to be overwritten', async () => {
        await testObj.create({subject: '123', class: '456'});
        const callArg = client.createEntity.calls[0].arg;
        assert.equal(callArg.type, 'ClassAssertion');
        assert.equal(callArg.class, '456');
        assert.equal(callArg.subject, '123');
      });

      after(() => {
        testObj.fieldsDefault = { class: '', subject: '0x00' };
      });

    });

    context('with wrong params', () => {

      it('should use base defaults', async () => {
        await testObj.create({doesNotExist: '123'});
        const callArg = client.createEntity.lastCall.arg;
        assert.equal(callArg.type, 'ClassAssertion');
        assert.equal(callArg.class, '');
        assert.equal(callArg.subject, '0x00');
        assert.equal(callArg.doesNotExist, undefined);
      });

    });

  });

});
