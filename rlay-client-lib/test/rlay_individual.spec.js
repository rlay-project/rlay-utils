/* eslint-env node, mocha */
const assert = require('assert');
const { Rlay_Individual, Entity } = require('../src/rlay');
const { mockClient, mockCreateEntity, mockFindEntity } = require('./mocks/client');
const { Client } = require('../src/client');

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
  beforeEach(() => mockCreateEntity(mockClient));
  beforeEach(() => mockFindEntity(mockClient));

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

    it('should call `client.createEntity` with correct payloads for assertions', async () => {
      const callArgs = mockClient.createEntity.calls.slice(0, 2).map(c => c.args);
      const expected = [
        [
          {
            annotations: [],
            subject: '0x00',
            class: '0x018080031b204691534dff630c4482c3b92a7521a1138c4621af6618497bbc052136064b7333',
            type: 'ClassAssertion'
          }
        ],
        [
          {
            annotations: [],
            subject: '0x00',
            class: '0x018080031b20294e1a2e4c2b7dbcd0f1427dc4691333eabe9749b161bbdf648c0ffe8fb93cb9',
            type: 'ClassAssertion'
          }
        ]
      ];
      assert.deepEqual(callArgs, expected);
    })

    it('should call `client.createEntity` with the correct payload', async () => {
      const target = { ...defaultPayload,
        ...{
          class_assertions: [
            '0x019880031b209da9db38ae4f6bdf949b76be505d22d45181d2e2e139f24a082d9e4544698623',
            '0x019880031b208f7396cbe61cfd8b823cfc20f162484f52e958029fe5c7c69f63dbf6538b7f5e'
          ]
        }};
      assert.deepEqual(callArg, target);
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

      it('should use base defaults', async () => {
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
