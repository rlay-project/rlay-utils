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

  describe('.fetch', () => {
    it('calls out to the client to fetch the entity', async () => {
      result = await target.fetch();
      console.log(target);
      console.log(result);
      assert.equal(mockClient.findEntityByCID.callCount, 1);
    });

    context('findEntityByCID=SUCCESS', () => {
      it('returns a `TestEntity` instance', async () => {
        result = await TestEntity.find('123');
        assert.equal(result instanceof TestEntity, true);
      });
    });

    context('findEntityByCID=NONE', () => {
      it('returns null', async () => {
        result = await TestEntity.find('CID_NOT_FOUND');
        assert.equal(result, null);
      });
    });

    context('findEntityByCID=FAILURE', () => {
      it('returns an `Error`', async () => {
        TestEntity.find('CID_CONNECTION_ERROR').
          catch(result => assert.equal(result instanceof Error, true))
      });
    });
  });
});
