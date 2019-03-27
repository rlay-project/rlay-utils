const assert = require('assert');
const { Client } = require('../src/client');
const Individual = require('../src/individual');
const { cids, schema} = require('./assets');

let rlay;

describe('Client', () => {

  describe('new', () => {

    beforeEach(() => {
      rlay = new Client();
      rlay.initSchema(cids, schema);
      rlay.initClient();
    })

    it('should have .Individual property', async () => {
      assert.equal(rlay.Individual instanceof Individual, true);
    });

  });

  describe('.initClient', () => {

    beforeEach(() => {
      rlay = new Client();
      rlay.initSchema(cids, schema);
      rlay.initClient();
    })

    it('should create ASYNC `assert` functions', () => {
      assert.equal(rlay.assertHttpConnection[Symbol.toStringTag], 'AsyncFunction');
    });

    it ('should create `prepare` functions', () => {
      assert.equal(rlay.prepareHttpConnection instanceof Function, true);
    });

    it ('should create proper `prepare-ClassAssertion` functions', () => {
      const assertion = JSON.stringify({
        type: 'ClassAssertion',
        subject: '0x00',
        class: '0x01' });
      assert.equal(JSON.stringify(rlay.prepareHttpConnection()), assertion);
    });

    xit ('should create proper `prepare-DataPropertyAssertion` functions', () => {
      const assertion = JSON.stringify({
        type: 'DataPropertyAssertion',
        subject: '0x01',
        class: undefined });
      assert.equal(JSON.stringify(rlay.prepareHttpConnection()), assertion);
    });

    xit ('should create proper `prepare-ObjectPropertyAssertion` functions', () => {
      const assertion = JSON.stringify({
        type: 'ObjectPropertyAssertion',
        subject: '0x01',
        class: undefined });
      assert.equal(JSON.stringify(rlay.prepareHttpConnection()), assertion);
    });

    it ('should create proper `prepare-Individual` function', () => {
      assert.equal(JSON.stringify(rlay.prepareIndividual({})), '{"type":"Individual"}');
    });

  });

});
