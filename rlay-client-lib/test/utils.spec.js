/* eslint-env node, mocha */
const assert = require('assert');
const sinon = require('sinon');
const utils = require('../src/utils.js');

const newPromise = () => new Promise((resolve, reject) => resolve(false));

describe('utils', () => {
  describe('wrapDebug', () => {
    let debugFn = sinon.spy();
    let result;
    before(async () => {
      // setup
      debugFn = sinon.spy();
      // call wrapDebug
      result = await utils.wrapDebug(newPromise(), debugFn);
    })

    it('return promise result', () => {
      assert.equal(result, false)
    })

    it('calls debugFn', () => {
      assert.equal(debugFn.callCount, 1);
    });
  });

  describe('createDebugFnObject', () => {
    it('returns correct object', () => {
      assert.deepEqual(Object.keys(utils.createDebugFnObject()), ['startTimestamp']);
    });
  });
});
