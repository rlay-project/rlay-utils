/* eslint-env node, mocha */
const assert = require('assert');
const check = require('check-types');
const RlayEntities = require('../src/rlay');
const { mockClient, mockCreateEntity } = require('./mocks/client');
const { cids } = require('./assets');

const { Entity,
  Rlay_ClassAssertion,
  Rlay_DataPropertyAssertion,
  Rlay_ObjectPropertyAssertion } = RlayEntities;

const client = mockClient;

describe('Client', () => {
  beforeEach(() => mockCreateEntity(client));

  describe('new', () => {
    it('should have the Rlay Entities exposed', async () => {
      // Remove `Entity` because it's prototype is not an instance of itself
      Object.keys(RlayEntities).slice(1).forEach(rlayEntityName => {
        assert(
          client[rlayEntityName].prototype instanceof Entity === true,
          `${rlayEntityName} is not exposed through client`
        );
      });
    });

    it('should have `Rlay_Individual` also exposed as `Individual', async () => {
      assert.equal(client.Individual, client.Rlay_Individual);
    });

    it('should have `Entity` exposed', async () => {
      assert.equal(client.Entity, Entity);
    });

    it('should have set the `.client` for all Rlay Entities', async () => {
      // Remove `Entity` because it's prototype is not an instance of itself
      Object.keys(RlayEntities).forEach(rlayEntityName => {
        assert(
          client[rlayEntityName].client === client,
          `${rlayEntityName} does not have '.client' set`
        );
      });
    });
  });

  describe('.initSchema', () => {
    it('exposes them under .schema', () => {
      const schemaEntityKeys = Object.keys(client.schema);
      assert.equal(schemaEntityKeys.length, 120);
    });

    it('exposes cids for all', () => {
      const schemaEntityKeys = Object.keys(client.schema);
      schemaEntityKeys.forEach(key => {
        assert.equal(check.string(client.schema[key].cid), true);
      });
    });

    it('exposes entities for non-annotation payloads', () => {
      const schemaEntityKeys = Object.keys(client.schema);
      schemaEntityKeys.forEach(key => {
        if (!key.includes('Label') &&
          !key.includes('Description') &&
          !key.includes('AnnotationProperty')) {
          assert.equal(check.instance(client.schema[key], Entity), true);
        }
      });
    });
  });

  describe('.initClient', () => {
    context('Class', () => {
      let keys;
      beforeEach(() => keys = Object.keys(client).
        filter(key => key.slice(-5) === 'Class').
        filter(key => key.slice(0, 4) !== 'Rlay')
      );

      it('creates correct amount of Rlay_ClassAssertions', () => {
        assert.equal(keys.length, 14);
      });

      it('attaches correct Rlay_ClassAssertion', () => {
        keys.forEach(key => {
          assert.equal(client[key].prototype instanceof Rlay_ClassAssertion, true);
        });
      });

      it('attaches correct .class field defaults', () => {
        keys.forEach(key => {
          assert.equal(client[key].fieldsDefault.class, cids[key], 'faulty default class');
        });
      });
    });

    context('DataProperty', () => {
      let keys;
      beforeEach(() => keys = Object.keys(client).
        filter(key => key.slice(-12) === 'DataProperty').
        filter(key => key.slice(0, 4) !== 'Rlay')
      );

      it('creates correct amount of Rlay_DataPropertyAssertions', () => {
        assert.equal(keys.length, 17);
      });

      it('attaches correct Rlay_DataPropertyAssertion', () => {
        keys.forEach(key => {
          assert.equal(client[key].prototype instanceof Rlay_DataPropertyAssertion, true);
        });
      });

      it('attaches correct .property field defaults', () => {
        keys.forEach(key => {
          assert.equal(client[key].fieldsDefault.property, cids[key], 'faulty default property');
        });
      });
    });

    context('ObjectProperty', () => {
      let keys;
      beforeEach(() => keys = Object.keys(client).
        filter(key => key.slice(-14) === 'ObjectProperty').
        filter(key => key.slice(0, 4) !== 'Rlay')
      );

      it('creates correct amount of Rlay_ObjectPropertyAssertions', () => {
        assert.equal(keys.length, 8);
      });

      it('attaches correct Rlay_ObjectPropertyAssertion', () => {
        keys.forEach(key => {
          assert.equal(client[key].prototype instanceof Rlay_ObjectPropertyAssertion, true);
        });
      });

      it('attaches correct .property field defaults', () => {
        keys.forEach(key => {
          assert.equal(client[key].fieldsDefault.property, cids[key], 'faulty default property');
        });
      });
    });
  });
});
