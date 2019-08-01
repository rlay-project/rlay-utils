/* eslint-env node, mocha */
const assert = require('assert');
const { mockClient, mockCreateEntity, mockFindEntity } = require('./mocks/client');
const { SchemaPayload } = require('../src/schemaPayload');
const payloads = require('./assets/payloads');

const assertThrowsAsync = async (fn, regExp) => {
  let f = () => {};
  try { await fn(); } catch(e) { f = () => {throw e}; } finally {
    assert.throws(f, regExp);
  }
}

const examplePayload = {
  httpStatusCodeValueDataProperty: 200
};

const subjectCID = '0x01';

const defaultPayload = {
  "annotations": [],
  "class_assertions": [],
  "negative_class_assertions": [],
  "object_property_assertions": [],
  "negative_object_property_assertions": [],
  "data_property_assertions": [],
  "negative_data_property_assertions": [],
  "type": "Individual"
};

describe('SchemaPayload', () => {
  beforeEach(() => mockCreateEntity(mockClient));
  beforeEach(() => mockFindEntity(mockClient));

  describe('constructor', () => {
    context('invalid input', () => {
      context('invalid client', () => {
        it('throws', () => {
          assert.throws(() => new SchemaPayload(undefined, {}), /invalid client/u);
        });
      });

      context('invalid payload', () => {
        it('throws', () => {
          assert.throws(() => new SchemaPayload(mockClient, {
            schemaKeyDoesNotExistClass: true
          }), /invalid payload object/u);
        });
      });
    });

    context('valid input', () => {
      it('returns SchemaPayload instance', () => {
        const schemaPayload = new SchemaPayload(mockClient, examplePayload);
        assert.equal(schemaPayload instanceof SchemaPayload, true);
      });
    });
  });

  describe('.fromPayloads', () => {
    context('valid input', () => {
      it('returns a SchemaPayload instance', () => {
        const schemaPayload = SchemaPayload.fromPayloads(mockClient, [payloads.withCid]);
        assert.deepEqual(schemaPayload.payload, {
          httpAuthorityDataProperty: '(ACwAAAPkFRYBIA3M5dhCOFLtFPD9MIE-q1_hhlY,NAME_SEARCH,kw3v)'
        });
      });

      it('returns a SchemaPayload instance from empty payloads array', () => {
        const schemaPayload = SchemaPayload.fromPayloads(mockClient, []);
        assert.deepEqual(schemaPayload.payload, {});
      });
    });

    context('invalid input', () => {
      context('invalid client', () => {
        it('throws', () => {
          assert.throws(() => SchemaPayload.fromPayloads(undefined, {}), /invalid client/u);
        });
      });

      context('invalid payloads', () => {
        it('throws', () => {
          assert.throws(
            () => SchemaPayload.fromPayloads(mockClient, ['abc', {key: 123}]),
            /invalid payloads input/u);
        });
      });
    });
  });

  describe('.toIndividualEntityPayload', () => {
    it('returns a valid individual entity payload', async () => {
      const testObj = new SchemaPayload(mockClient, {httpConnectionClass: true});
      await testObj.create();
      const payload = testObj.toIndividualEntityPayload();
      const expectedPayload = JSON.parse(JSON.stringify(defaultPayload));
      expectedPayload.class_assertions = [
        '0x019880031b209da9db38ae4f6bdf949b76be505d22d45181d2e2e139f24a082d9e4544698623'
      ];
      assert.deepEqual(payload, expectedPayload);
    });
  });

  describe('.create', () => {
    context('no subject', () => {
      let testObj;
      let callArg;
      const createSchemaPayload = async payload => {
        testObj = new SchemaPayload(mockClient, payload);
        await testObj.create();
        callArg = mockClient.createEntity.calls[0].arg
      }

      context('ClassAssertion', () => {
        beforeEach(async () => createSchemaPayload({httpConnectionClass: true}));
        it('sets no special attribute', async () => {
          assert.equal(callArg.type, 'ClassAssertion');
          assert.equal(callArg.subject, '0x00');
        });
      });

      context('DataPropertyAssertion', () => {
        beforeEach(async () => createSchemaPayload({httpStatusCodeValueDataProperty: 200}));
        it('sets the correct target attribute', async () => {
          assert.equal(callArg.type, 'DataPropertyAssertion');
          assert.equal(callArg.subject, '0x00');
          assert.equal(mockClient.rlay.decodeValue(callArg.target), 200);
        });
      });

      context('ObjectPropertyAssertion', () => {
        context('individual entity with remote cid', () => {
          let objIndi;
          beforeEach(async () => {
            objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi.remoteCid = objIndi.cid;
            await createSchemaPayload({httpRequestsObjectProperty: objIndi});
          });
          it('sets the correct target attribute', async () => {
            assert.equal(callArg.type, 'ObjectPropertyAssertion');
            assert.equal(callArg.subject, '0x00');
            assert.notEqual(callArg.target, undefined);
            assert.equal(callArg.target, objIndi.remoteCid)
          });

          it('does not create the individual object first', async () => {
            assert.equal(mockClient.createEntity.callCount, 1);
          });
        });

        context('individual entity without remote cid', () => {
          let objIndi;
          beforeEach(async () => {
            objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            await createSchemaPayload({httpRequestsObjectProperty: objIndi});
            callArg = mockClient.createEntity.calls[1].arg;
          });
          it('sets the correct target attribute', async () => {
            assert.equal(callArg.type, 'ObjectPropertyAssertion');
            assert.equal(callArg.subject, '0x00');
            assert.notEqual(callArg.target, undefined);
            assert.equal(callArg.target, objIndi.remoteCid);
          });

          it('creates the individual object first', async () => {
            assert.equal(mockClient.createEntity.callCount, 2);
          });
        });

        context('invalid input', () => {
          it('throws', async () => {
            const fn = async () => createSchemaPayload({httpRequestsObjectProperty: '123'});
            await assertThrowsAsync(fn, /failed to create individual/u);
          });
        });
      });
    });

    context('subject', () => {
      context('ClassAssertion', () => {
        it('sets no special attribute', async () => {
          const testObj = new SchemaPayload(mockClient, {httpConnectionClass: true});
          await testObj.create({subject: subjectCID});
          const callArg = mockClient.createEntity.calls[0].arg
          assert.equal(callArg.type, 'ClassAssertion');
          assert.equal(callArg.subject, subjectCID);
        });
      });

      context('DataPropertyAssertion', () => {
        it('sets the correct target attribute', async () => {
          const testObj = new SchemaPayload(mockClient, {httpStatusCodeValueDataProperty: 200});
          await testObj.create({subject: subjectCID});
          const callArg = mockClient.createEntity.calls[0].arg
          assert.equal(callArg.type, 'DataPropertyAssertion');
          assert.equal(callArg.subject, subjectCID);
          assert.equal(mockClient.rlay.decodeValue(callArg.target), 200);
        });
      });

      context('ObjectPropertyAssertion', () => {
        context('individual entity with remote cid', () => {
          it('sets the correct target attribute', async () => {
            const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi.remoteCid = objIndi.cid;
            const testObj = new SchemaPayload(mockClient, {httpRequestsObjectProperty: objIndi});
            await testObj.create({subject: subjectCID});
            const callArg = mockClient.createEntity.calls[0].arg;
            assert.equal(callArg.type, 'ObjectPropertyAssertion');
            assert.equal(callArg.subject, subjectCID);
            assert.notEqual(callArg.target, undefined);
            assert.equal(callArg.target, objIndi.remoteCid)
          });

          it('does not create the individual object first', async () => {
            const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi.remoteCid = objIndi.cid;
            const testObj = new SchemaPayload(mockClient, {httpRequestsObjectProperty: objIndi});
            await testObj.create({subject: subjectCID});
            assert.equal(mockClient.createEntity.callCount, 1);
          });
        });

        context('individual entity without remote cid', () => {
          it('sets the correct target attribute', async () => {
            const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            const testObj = new SchemaPayload(mockClient, {httpRequestsObjectProperty: objIndi});
            await testObj.create({subject: subjectCID});
            const callArg = mockClient.createEntity.calls[1].arg;
            assert.equal(callArg.type, 'ObjectPropertyAssertion');
            assert.equal(callArg.subject, subjectCID);
            assert.notEqual(callArg.target, undefined);
            assert.equal(callArg.target, objIndi.remoteCid);
          });

          it('creates the individual object first', async () => {
            const objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            const testObj = new SchemaPayload(mockClient, {httpRequestsObjectProperty: objIndi});
            await testObj.create({subject: subjectCID});
            assert.equal(mockClient.createEntity.callCount, 2);
          });
        });

        context('invalid input', () => {
          it('throws', async () => {
            const fn = async () => {
              const testObj = new SchemaPayload(mockClient, {httpRequestsObjectProperty: '123'});
              await testObj.create({subject: subjectCID});
            };
            await assertThrowsAsync(fn, /failed to create individual/u);
          });
        });
      });
    });
  });
});
