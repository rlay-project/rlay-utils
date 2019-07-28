/* eslint-env node, mocha */
const assert = require('assert');
const { Rlay_Individual, Entity } = require('../src/rlay');
const { mockClient, mockCreateEntity, mockFindEntity } = require('./mocks/client');
const { Client } = require('../src/client');

const assertThrowsAsync = async (fn, regExp) => {
  let f = () => {};
  try { await fn(); } catch(e) { f = () => {throw e}; } finally {
    assert.throws(f, regExp);
  }
}

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

  it('initiates an individual entity', () => {
    const indi = new mockClient.Individual(mockClient, defaultPayload);
    const indi2 = mockClient.Individual.from(defaultPayload);
    const indi3 = mockClient.getEntityFromPayload(defaultPayload);
    assert.equal(indi.cid,
      '0x019680031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');
    assert.equal(indi instanceof mockClient.Rlay_Individual, true);
    assert.deepEqual(indi, indi2);
    assert.deepEqual(indi, indi3);
  });

  describe('static .create', () => {
    const createDefault = {
      httpConnectionClass: true,
      httpEntityHeaderClass: true
    };

    it('should call `client.createEntity` to create the Entity', async () => {
      const result = await testObj.create(createDefault);
      const callArg = mockClient.createEntity.lastCall.arg;
      assert.equal(mockClient.createEntity.callCount, 3);
    });

    it('should call `client.createEntity` with correct payloads for assertions', async () => {
      const result = await testObj.create(createDefault);
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
      const result = await testObj.create(createDefault);
      const callArg = mockClient.createEntity.lastCall.arg;
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
      const result = await testObj.create(createDefault);
      const callArg = mockClient.createEntity.lastCall.arg;
      assert.equal(result instanceof testObj, true);
      assert.equal(result.client instanceof Client, true);
      assert.equal(result.payload instanceof Object, true);
      assert.equal(typeof result.cid, 'string');
    });

    context('ClassAssertion', () => {
      it('sets no special attribute', async () => {
        const result = await testObj.create({httpConnectionClass: true});
        const callArg = mockClient.createEntity.calls[0].arg
        assert.equal(callArg.type, 'ClassAssertion');
      });
    });

    context('DataPropertyAssertion', () => {
      it('sets the correct target attribute', async () => {
        const result = await testObj.create({httpStatusCodeValueDataProperty: 200});
        const callArg = mockClient.createEntity.calls[0].arg
        assert.equal(callArg.type, 'DataPropertyAssertion');
        assert.equal(mockClient.rlay.decodeValue(callArg.target), 200);
      });
    });

    context('ObjectPropertyAssertion', () => {
      context('individual entity with remote cid', () => {
        it('sets the correct target attribute', async () => {
          const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
          objIndi.remoteCid = objIndi.cid;
          const result = await testObj.create({httpRequestsObjectProperty: objIndi});
          const callArg = mockClient.createEntity.calls[0].arg;
          assert.equal(callArg.type, 'ObjectPropertyAssertion');
          assert.notEqual(callArg.target, undefined);
          assert.equal(callArg.target, objIndi.remoteCid)
        });

        it('does not create the individual object first', async () => {
          const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
          objIndi.remoteCid = objIndi.cid;
          await testObj.create({httpRequestsObjectProperty: objIndi});
          assert.equal(mockClient.createEntity.callCount, 2);
        });
      });

      context('individual entity without remote cid', () => {
        it('sets the correct target attribute', async () => {
          const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
          const result = await testObj.create({httpRequestsObjectProperty: objIndi});
          const callArg = mockClient.createEntity.calls[1].arg;
          assert.equal(callArg.type, 'ObjectPropertyAssertion');
          assert.notEqual(callArg.target, undefined);
          assert.equal(callArg.target, objIndi.remoteCid);
        });

        it('creates the individual object first', async () => {
          const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
          await testObj.create({httpRequestsObjectProperty: objIndi});
          assert.equal(mockClient.createEntity.callCount, 3);
        });
      });

      context('invalid input', () => {
        it('throws', async () => {
          const fn = async () => testObj.create({httpRequestsObjectProperty: '123'})
          assertThrowsAsync(fn, /failed to create individual/u);
        });
      });
    });

    context('without custom defaults', () => {
      it('should use base defaults', async () => {
        await testObj.create();
        const callArg = mockClient.createEntity.lastCall.arg;
        assert.deepEqual(callArg, defaultPayload);
      });
    });

    context('with wrong params', () => {
      it('throws', async () => {
        const fn = async () => testObj.create({doesNotExist: '123'})
        assertThrowsAsync(fn, /failed to create individual/u);
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
