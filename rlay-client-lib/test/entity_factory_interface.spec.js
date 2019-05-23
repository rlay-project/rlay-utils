/* eslint-env node, mocha */
const assert = require('assert');
const { EntityFactoryInterface } = require('../src/entity');
const mockClient = require('./mocks/client');
const { mix } = require('mixwith');

class TestEntity extends mix(Object).with(EntityFactoryInterface) {}

TestEntity.client = mockClient;
TestEntity.fields = [];

mockClient.Rlay_TestEntity = TestEntity;

describe('EntityFactoryInterface', () => {
  describe('.create', () => {

    let result;
    afterEach(() => mockClient.createEntity.reset());

    it('calls out to the client to create the entity', async () => {
      result = await TestEntity.create({type: 'TestEntity'});
      assert.equal(mockClient.createEntity.callCount, 1);
    });

    context('createEntity=SUCCESS', () => {
      it('returns a `TestEntity` instance', async () => {
        result = await TestEntity.create({type: 'TestEntity'});
        assert.equal(result instanceof TestEntity, true);
      });
    });

    context('createEntity=FAILURE', () => {
      it('returns an `Error`', async () => {
        TestEntity.create({type: 'CONNECTION_ERROR'}).
          catch(result => assert.equal(result instanceof Error, true));
      });
    });
  });

  describe('.find', () => {

    let result;
    afterEach(() => mockClient.findEntityByCID.reset());

    it('calls out to the client to fetch the entity', async () => {
      result = await TestEntity.find('123');
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
