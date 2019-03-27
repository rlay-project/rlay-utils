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
      async (entity) => Promise.resolve('0x0000')
    );
  });

  describe('.create', () => {

    it('should have an ASYNC `.create` function', () => {
      assert.equal(indi.create[Symbol.toStringTag], 'AsyncFunction');
    });

    it('should create the individual', async () => {
      await indi.create({
        httpConnectionClass: true,
        httpEntityHeaderClass: true
      });
      assert.equal(rlay.createEntity.callCount, 3);
    });

  });

  describe('.assert', () => {

    it('should have an ASYNC `.assert` function', () => {
      assert.equal(indi.assert[Symbol.toStringTag], 'AsyncFunction');
    });

    it('should assert inherent properties', async () => {
      await indi.assert({
        httpConnectionClass: true,
        httpEntityHeaderClass: true
      });
      const firstCall = rlay.createEntity.calls[0];
      const secondCall = rlay.createEntity.calls[0];
      assert.equal(firstCall.arg.subject, '0x00');
      assert.equal(secondCall.arg.subject, '0x00');
      assert.equal(rlay.createEntity.callCount, 2);
    });

    it('should assert assertions about an individual', async () => {
      const individualCID = '0x10';
      await indi.assert({
        httpConnectionClass: true,
        httpEntityHeaderClass: true
      }, individualCID);
      const firstCall = rlay.createEntity.calls[0];
      const secondCall = rlay.createEntity.calls[0];
      assert.equal(firstCall.arg.subject, individualCID);
      assert.equal(secondCall.arg.subject, individualCID);
      assert.equal(rlay.createEntity.callCount, 2);
    });

  });

});
