const assert = require('assert');
const simple = require('simple-mock')
const {
  Rlay_Class,
  Rlay_ClassAssertion,
  Rlay_DataProperty,
  Rlay_DataPropertyAssertion,
  Rlay_ObjectProperty,
  Rlay_ObjectPropertyAssertion } = require('../src/rlay');
const { EntityMetaFactory } = require('../src/entity');
const { Client } = require('../src/client');
const { cids, schema} = require('./assets');
const { UnknownEntityError } = require('../src/errors');

let client;
let testObj;

describe('EntityMetaFactory', () => {

  beforeEach(() => {
    client = new Client();
    client.initSchema(cids, schema);
    client.initClient();
    testObj = new EntityMetaFactory(client);
  });

  beforeEach(() => {
    // mock it
    simple.mock(client, 'createEntity').callFn(
      async (entity) => Promise.resolve('0x0000')
    );
  });

  describe('.fromSchema', () => {

    context('with `Rlay_Class` instance', () => {

      let rlayClassInstance;
      let customClassAssertion;

      beforeEach(async () => {
        rlayClassInstance = await Rlay_Class.create();
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
        const targetFields = JSON.stringify(Rlay_ClassAssertion.fields);
        assert.equal(JSON.stringify(customClassAssertion.fields), targetFields);
      });

      it('has `.fieldDefaults` set for `class` with its own CID', () => {
        const defaultFields = JSON.stringify({
          subject: '0x00',
          class: rlayClassInstance.cid
        });
        assert.equal(JSON.stringify(customClassAssertion.fieldsDefault), defaultFields);
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
          subject: '0x00',
          property: rlayClassInstance.cid
        });
        assert.equal(JSON.stringify(customClassAssertion.fieldsDefault), defaultFields);
      });

    });
  });
});
