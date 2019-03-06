const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { Client } = require('../src/client.js');
const assets = require('./assets');

let rlay;

describe('Client', () => {

  describe('initSchema', () => {

    beforeEach(() => {
      rlay = new Client();
      assets.schema.forEach(assertion => {
        rlay.initSchema(assertion.name, assertion.data);
      });
    })

    it('should create ASYNC `assert` functions', () => {
      assert.equal(rlay.assertPublicUnicorn[Symbol.toStringTag], 'AsyncFunction');
    });

    it ('should create `prepare` functions', () => {
      assert.equal(rlay.preparePublicUnicorn instanceof Function, true);
    });

    it ('should create proper `prepare-ClassAssertion` functions', () => {
      const assertion = JSON.stringify({
        type: 'ClassAssertion',
        subject: '0x00',
        class: undefined });
      assert.equal(JSON.stringify(rlay.preparePublicUnicorn()), assertion);
    });

    xit ('should create proper `prepare-DataPropertyAssertion` functions', () => {
      const assertion = JSON.stringify({
        type: 'DataPropertyAssertion',
        subject: '0x00',
        class: undefined });
      assert.equal(JSON.stringify(rlay.preparePublicUnicorn()), assertion);
    });

    xit ('should create proper `prepare-ObjectPropertyAssertion` functions', () => {
      const assertion = JSON.stringify({
        type: 'ObjectPropertyAssertion',
        subject: '0x00',
        class: undefined });
      assert.equal(JSON.stringify(rlay.preparePublicUnicorn()), assertion);
    });

    it ('should create proper `prepare-Individual` function', () => {
      assert.equal(JSON.stringify(rlay.prepareIndividual({})), '{"type":"Individual"}');
    });

  });

});
