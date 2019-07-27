/* eslint-env node, mocha */
const assert = require('assert');
const { EntityFactoryInterface } = require('../src/entity');
const EntityInterface = require('../src/entity/entity');
const { mockClient, mockCreateEntity, mockFindEntity } = require('./mocks/client');
const { mix } = require('mixwith');

class TestEntity extends mix(Object).with(EntityFactoryInterface) {}

TestEntity.client = mockClient;
TestEntity.fields = [];

describe('EntityFactoryInterface', () => {
  describe('.create', () => {
    beforeEach(() => mockCreateEntity(mockClient));
    let result;

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
    beforeEach(() => mockFindEntity(mockClient));
    let result;
    context('with fetchBoolean = true', () => {

      context('with CID that exists', () => {
        it('returns a `Entity` instance', async () => {
          const result = await TestEntity.find('CID_EXISTS');
          assert.equal(result instanceof EntityInterface, true);
        });

        it('calls multiple times to fetch connected entities', async () => {
          const callCountBefore = mockClient.findEntityByCID.callCount;
          await TestEntity.find('CID_EXISTS', true);
          assert.equal(mockClient.findEntityByCID.callCount, callCountBefore + 3);
        });
      });

      context('with CID not found', () => {
        it('returns null', async () => {
          result = await TestEntity.find('CID_NOT_FOUND');
          assert.equal(result, null);
        });
      });

      context('with connection error to rlay-client server', () => {
        it('returns an `Error`', async () => {
          TestEntity.find('CID_CONNECTION_ERROR').
            catch(result => assert.equal(result instanceof Error, true))
        });
      });
    });

    context('with fetchBoolean = false', () => {
      context('with CID that exists', () => {
        it('returns a `Entity` instance', async () => {
          const result = await TestEntity.find('CID_EXISTS', false)
          assert.equal(result instanceof EntityInterface, true);
        });

        it('calls only once', async () => {
          const callCountBefore = mockClient.findEntityByCID.callCount;
          await TestEntity.find('CID_EXISTS', false)
          assert.equal(mockClient.findEntityByCID.callCount, callCountBefore + 1);
        });
      });

      context('with CID not found', () => {
        it('returns null', async () => {
          result = await TestEntity.find('CID_NOT_FOUND', false);
          assert.equal(result, null);
        });
      });

      context('with connection error to rlay-client server', () => {
        it('returns an `Error`', async () => {
          TestEntity.find('CID_CONNECTION_ERROR', false).
            catch(result => assert.equal(result instanceof Error, true))
        });
      });
    });
  });
});
