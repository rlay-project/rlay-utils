const assert = require('assert');
const simple = require('simple-mock')
const {
  Rlay_Individual,
  Rlay_Annotation,
  Rlay_AnnotationProperty,
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

  describe('.fromType', () => {

    context('with `Annotation`', () => {

      it('returns an `Rlay_Annotation` instance', () => {
        const result = testObj.fromType('Annotation', {}, '0x01');
        assert.equal(result instanceof Rlay_Annotation, true);
      });

    });

    context('with `AnnotationProperty`', () => {

      it('returns an `Rlay_AnnotationProperty` instance', () => {
        const result = testObj.fromType('AnnotationProperty', {}, '0x01');
        assert.equal(result instanceof Rlay_AnnotationProperty, true);
      });

    });

    context('with `Class`', () => {

      it('returns an `Rlay_Class` instance', () => {
        const result = testObj.fromType('Class', {}, '0x01');
        assert.equal(result instanceof Rlay_Class, true);
      });

    });

    context('with `ClassAssertion`', () => {

      it('returns an `Rlay_ClassAssertion` instance', () => {
        const result = testObj.fromType('ClassAssertion', {}, '0x01');
        assert.equal(result instanceof Rlay_ClassAssertion, true);
      });

    });

    context('with `DataProperty`', () => {

      it('returns an `Rlay_DataProperty` instance', () => {
        const result = testObj.fromType('DataProperty', {}, '0x01');
        assert.equal(result instanceof Rlay_DataProperty, true);
      });

    });

    context('with `DataPropertyAssertion`', () => {

      it('returns an `Rlay_DataPropertyAssertion` instance', () => {
        const result = testObj.fromType('DataPropertyAssertion', {}, '0x01');
        assert.equal(result instanceof Rlay_DataPropertyAssertion, true);
      });

    });

    context('with `ObjectProperty`', () => {

      it('returns an `Rlay_ObjectProperty` instance', () => {
        const result = testObj.fromType('ObjectProperty', {}, '0x01');
        assert.equal(result instanceof Rlay_ObjectProperty, true);
      });

    });

    context('with `ObjectPropertyAssertion`', () => {

      it('returns an `Rlay_ObjectPropertyAssertion` instance', () => {
        const result = testObj.fromType('ObjectPropertyAssertion', {}, '0x01');
        assert.equal(result instanceof Rlay_ObjectPropertyAssertion, true);
      });

    });

    context('with `Individual`', () => {

      it('returns an `Rlay_Individual` instance', () => {
        const result = testObj.fromType('Individual', {}, '0x01');
        assert.equal(result instanceof Rlay_Individual, true);
      });

    });

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
