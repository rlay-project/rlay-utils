const assert = require('assert');
const simple = require('simple-mock')
const { Client } = require('../src/client');
const { Rlay_Individual, Rlay_ClassAssertion, Entity } = require('../src/rlay');
const { cids, schema} = require('./assets');

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
      assert.equal(client.Rlay_Individual.prototype instanceof Entity, true);
    });

    it('should have `Rlay_Individual` also exposed as `Individual', async () => {
      assert.equal(client.Individual, client.Rlay_Individual);
    });

  });

  describe('.initClient', () => {

    it('should expose the schema correctly', async () => {
      assert.equal(client.httpConnectionClass.prototype instanceof Rlay_ClassAssertion, true);
    });

  });

});
