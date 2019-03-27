const assert = require('assert');
const simple = require('simple-mock')
const Individual = require('../src/individual');
const { Client } = require('../src/client');
const { cids, schema} = require('./assets');

let rlay;
let indi;

describe('Individual', () => {

  beforeEach(() => {
    rlay = new Client();
    rlay.initSchema(cids, schema);
    rlay.initClient();
    indi = new Individual(rlay);
  })

  beforeEach(() => {
    // mock it
    simple.mock(rlay, 'createEntity').callFn(
      async (entity) => Promise.resolve(entity)
    );
  });

  describe('.create', () => {

    it('should have an ASYNC `.create` function', () => {
      assert.equal(indi.create[Symbol.toStringTag], 'AsyncFunction');
    });

    it('should create the entity', async () => {
      await indi.create({
        httpConnectionClass: true,
        httpEntityHeaderClass: true
      });
      assert.equal(rlay.createEntity.callCount, 3);
    });

  });

});
