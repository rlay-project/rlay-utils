const assert = require('assert');
const simple = require('simple-mock')
const { Client } = require('../src/client');
const RlayEntities = require('../src/rlay');
const { cids, schema} = require('./assets');

const Entity = RlayEntities.Entity;
const Rlay_ClassAssertion = RlayEntities.Rlay_ClassAssertion;

let client;

describe('Client', () => {

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

  describe('.initClient', () => {
    it('should expose the schema correctly', async () => {
      assert.equal(client.httpConnectionClass.prototype instanceof Rlay_ClassAssertion, true);
    });
  });

});
