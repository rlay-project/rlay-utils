/* eslint-env node, mocha */
const assert = require('assert');
const { EntityInterface } = require('../src/entity');
const mockClient = require('./mocks/client');
const payloads = require('./assets/payloads');

class TestEntity extends EntityInterface {}

TestEntity.client = mockClient;
TestEntity.fields = [];

let target;
const targetCID = '123';

describe('EntityInterface', () => {
  beforeEach(() => target = new TestEntity(
    mockClient,
    payloads.dataPropertyAssertion,
    targetCID));

  describe('._schemaKeyHandler', () => {
    it('works', () => {
      target._schemaKeyHandler('property', target.schema);
    })
  });

  describe('.cid', () => {
    it('returns the CID of the entity, without a roundtrip', () => {
      assert.equal(target.cid,
        '0x019c80031b202a4f5104920c65b27a0fd9c17d0f2a3a9239a0277c0784b5666cbc067656f487');
    });
  });

  describe('.fetch', () => {
    it('calls out to the client to fetch the entity', async () => {
      await target.fetch();
      assert.equal(mockClient.findEntityByCID.callCount, 1);
    });
  });
});
