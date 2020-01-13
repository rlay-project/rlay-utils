/* eslint-env node, mocha */
const assert = require('assert');
const sinon = require('sinon');
const EntityInterface = require('../src/entity/entity');
const { Rlay_DataProperty } = require('../src/rlay');
const {
  stubCreateEntity,
  stubFindEntityByCid,
  stubFindEntityByCypher,
  stubResolveEntity
} = require('./mocks/client');
const payloads = require('./assets/payloads');

describe('EntityFactoryInterface', () => {
  let result;
  let clientCreateEntityStub, clientFindEntityByCIDStub;
  let clientFindEntityByCypherStub, clientResolveEntityStub;
  before(() => {
    let client = Rlay_DataProperty.client;
    clientCreateEntityStub = stubCreateEntity(client);
    clientFindEntityByCIDStub = stubFindEntityByCid(client);
    clientFindEntityByCypherStub = stubFindEntityByCypher(client);
    clientResolveEntityStub = stubResolveEntity(client);
  });
  afterEach(() => clientCreateEntityStub.resetHistory());
  afterEach(() => clientFindEntityByCIDStub.resetHistory());
  afterEach(() => clientFindEntityByCypherStub.resetHistory());
  afterEach(() => clientResolveEntityStub.resetHistory());

  describe('.from', () => {
    it('returns an instantiated entity', () => {
      const entity = Rlay_DataProperty.from(payloads.clone(payloads.dataProperty));
      assert.equal(entity instanceof Rlay_DataProperty, true);
    });
  });

  describe('.create', () => {
    it('calls out to the client to create the entity', async () => {
      result = await Rlay_DataProperty.create({type: 'TestEntity'});
      assert.equal(clientCreateEntityStub.callCount, 1);
    });

    context('createEntity=SUCCESS', () => {
      it('returns a `TestEntity` instance', async () => {
        result = await Rlay_DataProperty.create({type: 'TestEntity'});
        assert.equal(result instanceof Rlay_DataProperty, true);
      });
    });

    context('createEntity=FAILURE', () => {
      it('returns an `Error`', async () => {
        Rlay_DataProperty.create({type: 'CONNECTION_ERROR'}).
          catch(result => assert.equal(result instanceof Error, true));
      });
    });
  });

  describe('.find', () => {
    context('with fetchBoolean = true', () => {

      context('with CID that exists', () => {
        it('returns a `Entity` instance', async () => {
          const result = await Rlay_DataProperty.find('CID_EXISTS');
          assert.equal(result instanceof EntityInterface, true);
        });

        it('calls resolveEntity to fetch connected entities', async () => {
          await Rlay_DataProperty.find('CID_EXISTS', true);
          assert.equal(clientFindEntityByCIDStub.callCount, 1);
          assert.equal(clientResolveEntityStub.callCount, 1);
        });
      });

      context('with CID not found', () => {
        it('returns null', async () => {
          result = await Rlay_DataProperty.find('CID_NOT_FOUND');
          assert.equal(result, null);
        });
      });

      context('with connection error to rlay-client server', () => {
        it('returns an `Error`', async () => {
          Rlay_DataProperty.find('CID_CONNECTION_ERROR').
            catch(result => assert.equal(result instanceof Error, true))
        });
      });
    });

    context('with fetchBoolean = false', () => {
      context('with CID that exists', () => {
        it('returns a `Entity` instance', async () => {
          const result = await Rlay_DataProperty.find('CID_EXISTS', false)
          assert.equal(result instanceof EntityInterface, true);
        });

        it('calls only once', async () => {
          const callCountBefore = clientFindEntityByCIDStub.callCount;
          await Rlay_DataProperty.find('CID_EXISTS', false)
          assert.equal(clientFindEntityByCIDStub.callCount, callCountBefore + 1);
        });
      });

      context('with CID not found', () => {
        it('returns null', async () => {
          result = await Rlay_DataProperty.find('CID_NOT_FOUND', false);
          assert.equal(result, null);
        });
      });

      context('with connection error to rlay-client server', () => {
        it('returns an `Error`', async () => {
          Rlay_DataProperty.find('CID_CONNECTION_ERROR', false).
            catch(result => assert.equal(result instanceof Error, true))
        });
      });
    });
  });
});
