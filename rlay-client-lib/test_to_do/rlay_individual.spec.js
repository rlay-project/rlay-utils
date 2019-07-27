/* eslint-env node, mocha */
const assert = require('assert');
const { Rlay_Individual, Entity } = require('../src/rlay');
const initMockClient = require('./mocks/client');
const { Client } = require('../src/client');

let mockClient;
const testObj = Rlay_Individual;
const testObjType = 'Individual';
const defaultPayload = {
  "annotations": [],
  "class_assertions": [],
  "negative_class_assertions": [],
  "object_property_assertions": [],
  "negative_object_property_assertions": [],
  "data_property_assertions": [],
  "negative_data_property_assertions": [],
  "type": testObjType
};

describe('Rlay_Individual', () => {

  beforeEach(() => mockClient = initMockClient());

  it('should inherit `Entity`', () => {
    assert.equal(testObj.prototype instanceof Entity, true);
  });

  it('should have `.client` defined', () => {
    assert.equal(testObj.client instanceof Client, true);
  });

  it('should have `.intermediate` defined', () => {
    assert.equal(testObj.intermediate instanceof Object, true);
  });

  describe('static .create', () => {

    let result;
    let callArg;
    beforeEach(async () => {
      result = await testObj.create({
        httpConnectionClass: true,
        httpEntityHeaderClass: true
      });
      callArg = mockClient.createEntity.lastCall.arg;
    });

    it('should call `client.createEntity` to create the Entity', async () => {
      assert.equal(mockClient.createEntity.callCount, 3);
    });

    it('should call `client.createEntity` with the correct payload', async () => {
      const target = JSON.stringify(Object.assign(
        Object.assign({}, defaultPayload),
        {
          class_assertions: [
            '0x019880031b20dfa54e6d5eae5479f0361f263f81c59198bec4201bd17023260903eeaff3b84f',
            '0x019880031b20dfa54e6d5eae5479f0361f263f81c59198bec4201bd17023260903eeaff3b84f'
          ]
        }
      ));
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
        callArg = mockClient.createEntity.lastCall.arg;
      });

      it ('should use base defaults', async () => {
        const target = JSON.stringify(defaultPayload);
        assert.equal(JSON.stringify(callArg), target);
      })
    });

    context('with wrong params', () => {

      beforeEach(async () => {
        result = await testObj.create({doesNotExist: '123'});
        callArg = mockClient.createEntity.lastCall.arg;
      });

      it('should use base defaults', async () => {
        const target = JSON.stringify(defaultPayload);
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
      callArg = mockClient.createEntity.lastCall.arg;
    });

    it('should call `client.createEntity` to create the `Assertion`(s)', async () => {
      assert.equal(mockClient.createEntity.callCount, 3);
    });

    it('have `Individual.cid` as `subject` for `Assertion`(s)', async () => {
      assert.equal(callArg.subject, instance.cid);
    });

  });
});
