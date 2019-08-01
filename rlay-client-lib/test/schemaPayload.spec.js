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
    context('single', () => {
      it('returns correct SchemaPayload instance', () => {
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

    context('multiple', () => {
      it('returns correct SchemaPayload instance', () => {
        const schemaPayload = SchemaPayload.fromPayloads(mockClient, [payloads.withCid, payloads.withCid]);
        assert.deepEqual(schemaPayload.payload, {
          httpAuthorityDataProperty: [
            '(ACwAAAPkFRYBIA3M5dhCOFLtFPD9MIE-q1_hhlY,NAME_SEARCH,kw3v)',
            '(ACwAAAPkFRYBIA3M5dhCOFLtFPD9MIE-q1_hhlY,NAME_SEARCH,kw3v)'
          ]
        });
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
      let callArgs;
      const createSchemaPayload = async (payload, options) => {
        testObj = new SchemaPayload(mockClient, payload);
        await testObj.create(options);
        callArg = mockClient.createEntity.calls[0].arg
        callArgs = mockClient.createEntity.calls.map(call => call.arg);
      }

      context('ClassAssertion', () => {
        context('single', () => {
          beforeEach(async () => createSchemaPayload({httpConnectionClass: true}));
          it('sets no special attribute', async () => {
            assert.equal(callArg.type, 'ClassAssertion');
            assert.equal(callArg.subject, '0x00');
          });

          it('creates it once', () => assert.equal(mockClient.createEntity.callCount, 1));
        });

        context('single with options', () => {
          beforeEach(async () => createSchemaPayload({httpConnectionClass: true}, {subject: subjectCID}));
          it('sets the correct attributes', async () => {
            assert.equal(callArg.type, 'ClassAssertion');
            assert.equal(callArg.subject, subjectCID);
          });

          it('creates it once', () => assert.equal(mockClient.createEntity.callCount, 1));
        });

        context('multiple', () => {
          it('throws', async () => {
            await assertThrowsAsync(async () => {
              return createSchemaPayload({httpConnectionClass: [true, true]})
            }, /failed to create schema payload assertions/u);
          });

          it('creates none', async () => {
            await assertThrowsAsync(async () => {
              return createSchemaPayload({httpConnectionClass: [true, true]})
            }, /failed to create schema payload assertions/u);
            assert.equal(mockClient.createEntity.callCount, 0);
          });
        });
      });

      context('DataPropertyAssertion', () => {
        context('single', () => {
          beforeEach(async () => createSchemaPayload({httpStatusCodeValueDataProperty: 200}));
          it('sets the correct target attribute', async () => {
            assert.equal(callArg.type, 'DataPropertyAssertion');
            assert.equal(callArg.subject, '0x00');
            assert.equal(mockClient.rlay.decodeValue(callArg.target), 200);
          });

          it('creates it once', () => assert.equal(mockClient.createEntity.callCount, 1));
        });

        context('multiple', () => {
          beforeEach(async () => createSchemaPayload({httpStatusCodeValueDataProperty: [200, 201]}));
          it('sets the correct target attributes', async () => {
            callArgs.forEach(callArg => {
              assert.equal(callArg.type, 'DataPropertyAssertion');
              assert.equal(callArg.subject, '0x00');
            });
            assert.equal(mockClient.rlay.decodeValue(callArgs[0].target), 200);
            assert.equal(mockClient.rlay.decodeValue(callArgs[1].target), 201);
          });

          it('creates it twice', () => assert.equal(mockClient.createEntity.callCount, 2));
        });

        context('multiple with options', () => {
          beforeEach(async () => createSchemaPayload(
            {httpStatusCodeValueDataProperty: [200, 201]}, {subject: subjectCID}));
          it('sets the correct target attributes', async () => {
            callArgs.forEach(callArg => {
              assert.equal(callArg.type, 'DataPropertyAssertion');
              assert.equal(callArg.subject, subjectCID);
            });
            assert.equal(mockClient.rlay.decodeValue(callArgs[0].target), 200);
            assert.equal(mockClient.rlay.decodeValue(callArgs[1].target), 201);
          });

          it('creates it twice', () => assert.equal(mockClient.createEntity.callCount, 2));
        });
      });

      context('ObjectPropertyAssertion', () => {
        context('single with remote cid', () => {
          let objIndi;
          beforeEach(async () => {
            objIndi = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi.remoteCid = objIndi.cid;
            await createSchemaPayload({httpRequestsObjectProperty: objIndi});
          });
          it('sets the correct target attribute', async () => {
            assert.equal(callArg.type, 'ObjectPropertyAssertion');
            assert.equal(callArg.subject, '0x00');
            assert.equal(callArg.target !== undefined, true);
            assert.equal(callArg.target, objIndi.remoteCid)
          });

          it('does not create the individual object first', async () => {
            assert.equal(mockClient.createEntity.callCount, 1);
          });
        });

        context('single without remote cid', () => {
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

        context('multiple', () => {
          // eslint-disable-next-line init-declarations
          let callArgs, objIndi1, objIndi2;
          beforeEach(async () => {
            objIndi1 = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi1.remoteCid = objIndi1.cid;
            objIndi2 = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi2.remoteCid = objIndi2.cid;
          });
          beforeEach(async () => {
            await createSchemaPayload({httpRequestsObjectProperty: [objIndi1, objIndi2]});
            callArgs = mockClient.createEntity.calls.map(call => call.arg);
          });

          it('sets the correct target attributes', async () => {
            callArgs.forEach(callArg => {
              assert.equal(callArg.type, 'ObjectPropertyAssertion');
              assert.equal(callArg.subject, '0x00');
              assert.equal(callArg.target !== undefined, true);
            });
            assert.equal(callArgs[0].target, objIndi1.remoteCid)
            assert.equal(callArgs[1].target, objIndi2.remoteCid)
          });

          it('creates it twice', () => assert.equal(mockClient.createEntity.callCount, 2));
        });

        context('multiple with options', () => {
          // eslint-disable-next-line init-declarations
          let callArgs, objIndi1, objIndi2;
          beforeEach(async () => {
            objIndi1 = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi1.remoteCid = objIndi1.cid;
            objIndi2 = new mockClient.Rlay_Individual(mockClient, defaultPayload);
            objIndi2.remoteCid = objIndi2.cid;
          });
          beforeEach(async () => {
            await createSchemaPayload(
              {httpRequestsObjectProperty: [objIndi1, objIndi2]}, {subject: subjectCID});
            callArgs = mockClient.createEntity.calls.map(call => call.arg);
          });

          it('sets the correct target attributes', async () => {
            callArgs.forEach(callArg => {
              assert.equal(callArg.type, 'ObjectPropertyAssertion');
              assert.equal(callArg.subject, subjectCID);
              assert.equal(callArg.target !== undefined, true);
            });
            assert.equal(callArgs[0].target, objIndi1.remoteCid)
            assert.equal(callArgs[1].target, objIndi2.remoteCid)
          });

          it('creates it twice', () => assert.equal(mockClient.createEntity.callCount, 2));
        });

        context('invalid input', () => {
          it('throws', async () => {
            const fn = async () => createSchemaPayload({httpRequestsObjectProperty: '123'});
            await assertThrowsAsync(fn, /failed to create individual/u);
          });
        });
      });
    });
  });
});
