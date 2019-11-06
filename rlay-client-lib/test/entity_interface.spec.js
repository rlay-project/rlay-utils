/* eslint-env node, mocha */
const assert = require('assert');
const check = require('check-types');
const { Client } = require('../src/index.js');
const { EntityInterface } = require('../src/entity');
const generateClient = require('./seed/generated/generateRlayClient.js');
const {
  stubCreateEntity,
  stubFindEntityByCid,
  stubFindEntityByCypher
} = require('./mocks/client');
const payloads = require('./assets/payloads');

let mockClient;
class TestEntity extends EntityInterface {}
TestEntity.fields = [];

const clone = obj => JSON.parse(JSON.stringify(obj));

describe('EntityInterface', () => {
  let target;
  let clientCreateEntityStub, clientFindEntityByCIDStub, clientFindEntityByCypherStub;
  before(() => {
    let client = new Client();
    clientCreateEntityStub = stubCreateEntity(client);
    clientFindEntityByCIDStub = stubFindEntityByCid(client);
    clientFindEntityByCypherStub = stubFindEntityByCypher(client);
    generateClient(client);
    TestEntity.client = client;
    mockClient = client;
  });
  beforeEach(() => clientCreateEntityStub.resetHistory());
  beforeEach(() => clientFindEntityByCIDStub.resetHistory());
  beforeEach(() => clientFindEntityByCypherStub.resetHistory());

  describe('constructor', () => {
    context('invalid client', () => {
      it('throws', () => {
        assert.throws(() => new TestEntity({}, {}), /invalid client/);
      });
    });

    context('invalid payload', () => {
      it('throws', () => {
        assert.throws(() => new TestEntity(mockClient, {}), /invalid payload/);
      });
    });

    context('payload with cid (remote payload)', () => {
      it('stores the cid at .remoteCid', () => {
        target = new TestEntity(mockClient, clone(payloads.withCid))
        assert.equal(target.remoteCid, payloads.withCid.cid);
      });

      it('removes `cid` from .payload', () => {
        target = new TestEntity(mockClient, clone(payloads.withCid))
        assert.equal(target.payload.cid, undefined);
      });

      it('.cid is the same as .remoteCid', () => {
        target = new TestEntity(mockClient, clone(payloads.withCid))
        assert.equal(target.remoteCid, target.cid);
      });

      context('malformed remote payload', () => {
        context('remote payload cid does not match local generated payload cid', () => {
          it('throws', () => {
            const payload = clone(payloads.withCid);
            payload.cid = 'NOT_THE_ACTUAL_CID_OF_THE_PAYLOAD';
            assert.throws(() => new TestEntity(mockClient, payload), /invalid cids/);
          });
        });
      });
    });

    context('payload without cid (local payload)', () => {
      beforeEach(() =>
        target = new TestEntity(mockClient, clone(payloads.withoutCid)))

      it('.remoteCid is undefined', () => {
        assert.equal(target.remoteCid, undefined);
      });

      it('`.payload.cid` is undefined', () => {
        assert.equal(target.payload.cid, undefined);
      });

      it('.cid is set and correct', () => {
        assert.equal(target.cid, payloads.withCid.cid);
      });
    });
  });

  describe('GETTER/SETTER', () => {
    describe('.remoteCid', () => {
      context('has remote CID', () => {
        it('returns the remote CID', () => {
          target = new TestEntity(mockClient, clone(payloads.withCid));
          assert.equal(target.remoteCid, payloads.dataPropertyAssertion.cid);
        });
      });
      context('has no remote CID', () => {
        it('returns undefined', () => {
          target = new TestEntity(mockClient, clone(payloads.withoutCid));
          assert.equal(target.remoteCid, undefined);
        });
      });
    });

    describe('.cid', () => {
      it('returns the CID of the entity, without a roundtrip', () => {
        assert.equal(target.cid, payloads.dataPropertyAssertion.cid);
      });
    });
  });

  describe('.create', () => {
    beforeEach(async () => {
      target = new TestEntity(mockClient, clone(payloads.withoutCid));
      await target.create();
    });

    it('calls the client to create the entity remote', async () => {
      assert.equal(clientCreateEntityStub.callCount, 1);
    });

    it('sets .remoteCid', async () => {
      assert.equal(target.remoteCid, payloads.withCid.cid);
    });
  });

  describe('.resolve', () => {
    beforeEach(async () => target.resolve());

    it('assigns the attributes correctly', async () => {
      assert.equal(check.string(target.target), true);
      assert.equal(check.instance(target.property, Object), true);
      assert.equal(check.null(target.subject), true);
      assert.equal(check.emptyArray(target.annotations), true);
      assert.equal(check.string(target.cid), true);
    });

    it('calls out to the client to resolve the CIDs', async () => {
      assert.deepEqual(clientFindEntityByCIDStub.getCalls().map(call => call.args), [
        ['0x00'],
        ['0x019480031b206a9cfaac8c40060e3e9a799df4d0788a1b7ce2f45640f962c23b36d2386b9560']
      ]);
    });
  });

  describe('.fetch', () => {
    it('is deprecated and calls .resolve', async () => {
      assert.deepEqual(await target.fetch(), await target.resolve());
    });
  });
});
