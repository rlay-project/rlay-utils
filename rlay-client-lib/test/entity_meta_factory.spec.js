/* eslint-env node, mocha */
const assert = require('assert');
const expect = require('chai').expect
const {
  Rlay_Class,
  Rlay_ClassAssertion,
  Rlay_DataProperty,
  Rlay_DataPropertyAssertion,
  Rlay_ObjectProperty,
  Rlay_ObjectPropertyAssertion } = require('../src/rlay');
const intermediate = require('../src/rlay/intermediate');
const { mockClient, mockCreateEntity } = require('./mocks/client');
const { EntityMetaFactory } = require('../src/entity');
const payloads = require('./assets/payloads');

let client;
let testObj;

describe('EntityMetaFactory', () => {
  beforeEach(() => mockCreateEntity(mockClient));
  beforeEach(() => testObj = new EntityMetaFactory(mockClient));

  describe('.getEntityFactoryFromPayload', () => {
    it('returns the correct EntityFactory', () => {
      const entityFactory = testObj.getEntityFactoryFromPayload(
        payloads.clone(payloads.dataProperty));
      assert.deepEqual(entityFactory, Rlay_DataProperty);
    });

    context('invalid payload', () => {
      context('missing type', () => {
        it('throws', () => {
          const invalidDataProperty = payloads.clone(payloads.dataProperty);
          invalidDataProperty.type = undefined;
          const fn = () => testObj.getEntityFactoryFromPayload(invalidDataProperty);
          assert.throws(fn, /failed to get entity factory/u);
        });
      });

      context('invalid type', () => {
        it('throws', () => {
          const invalidDataProperty = payloads.clone(payloads.dataProperty);
          invalidDataProperty.type = 'Rlay_DoesNotExist';
          const fn = () => testObj.getEntityFactoryFromPayload(invalidDataProperty);
          assert.throws(fn, /failed to get entity factory/u);
        });
      });
    });
  });

  describe('.fromType', () => {
    intermediate.kinds.forEach(intermediateKind => {
      context(`with ${intermediateKind.name}`, () => {
        it(`returns a Rlay_${intermediateKind.name} instance`, () => {
          const fn = () => testObj.fromType(intermediateKind.name, {})
          expect(fn).to.throw(/failed to create new entity/u);
        });
      });
    });
  });

  describe('.getEntityFromPayload', () => {
    it(`returns correct entity instance`, () => {
      const entity = testObj.getEntityFromPayload(payloads.clone(payloads.dataProperty));
      assert.equal(entity instanceof mockClient.Rlay_DataProperty, true);
    });
  });

  describe('.fromSchema', () => {
    context('with `Rlay_Class` instance', () => {
      let rlayClassInstance;
      let customClassAssertion;

      beforeEach(async () => {
        rlayClassInstance = await Rlay_Class.create();
        rlayClassInstance = mockClient.schema.httpConnectionClass;
        customClassAssertion = testObj.fromSchema(rlayClassInstance);
      });

      it('returns a `Rlay_ClassAssertion`', async () => {
        assert.equal(customClassAssertion.prototype instanceof Rlay_ClassAssertion, true);
      });

      it('has `.type` = `ClassAssertion`', () => {
        assert.equal(customClassAssertion.type, 'ClassAssertion');
      });

      it('has same client as instance', () => {
        assert.equal(customClassAssertion.client, rlayClassInstance.client);
      });

      it('has same fields as `Rlay_ClassAssertion`', () => {
        assert.deepEqual(customClassAssertion.fields, Rlay_ClassAssertion.fields);
      });

      it('has `.fieldDefaults` set for `class` with its own CID', () => {
        const defaultFields = {
          annotations: [],
          subject: '0x00',
          class: rlayClassInstance.cid
        };
        assert.deepEqual(customClassAssertion.fieldsDefault, defaultFields);
      });
    });

    context('with `Rlay_DataProperty` instance', () => {

      let rlayClassInstance;
      let customClassAssertion;

      beforeEach(async () => {
        rlayClassInstance = await Rlay_DataProperty.create();
        customClassAssertion = testObj.fromSchema(rlayClassInstance);
      });

      it('returns a `Rlay_DataPropertyAssertion`', async () => {
        assert.equal(customClassAssertion.prototype instanceof Rlay_DataPropertyAssertion, true);
      });

      it('has `.type` = `DataPropertyAssertion`', () => {
        assert.equal(customClassAssertion.type, 'DataPropertyAssertion');
      });

      it('has same client as instance', () => {
        assert.equal(customClassAssertion.client, rlayClassInstance.client);
      });

      it('has same fields as `Rlay_DataPropertyAssertion`', () => {
        const targetFields = JSON.stringify(Rlay_DataPropertyAssertion.fields);
        assert.equal(JSON.stringify(customClassAssertion.fields), targetFields);
      });

      it('has `.fieldDefaults` set for `class` with its own CID', () => {
        const defaultFields = JSON.stringify({
          annotations: [],
          subject: '0x00',
          property: rlayClassInstance.cid
        });
        assert.equal(JSON.stringify(customClassAssertion.fieldsDefault), defaultFields);
      });

    });

    context('with `Rlay_ObjectProperty` instance', () => {

      let rlayClassInstance;
      let customClassAssertion;

      beforeEach(async () => {
        rlayClassInstance = await Rlay_ObjectProperty.create();
        customClassAssertion = testObj.fromSchema(rlayClassInstance);
      });

      it('returns a `Rlay_ObjectPropertyAssertion`', async () => {
        assert.equal(customClassAssertion.prototype instanceof Rlay_ObjectPropertyAssertion, true);
      });

      it('has `.type` = `ObjectPropertyAssertion`', () => {
        assert.equal(customClassAssertion.type, 'ObjectPropertyAssertion');
      });

      it('has same client as instance', () => {
        assert.equal(customClassAssertion.client, rlayClassInstance.client);
      });

      it('has same fields as `Rlay_ObjectPropertyAssertion`', () => {
        const targetFields = JSON.stringify(Rlay_ObjectPropertyAssertion.fields);
        assert.equal(JSON.stringify(customClassAssertion.fields), targetFields);
      });

      it('has `.fieldDefaults` set for `class` with its own CID', () => {
        const defaultFields = JSON.stringify({
          annotations: [],
          subject: '0x00',
          property: rlayClassInstance.cid
        });
        assert.equal(JSON.stringify(customClassAssertion.fieldsDefault), defaultFields);
      });

    });
  });
});
