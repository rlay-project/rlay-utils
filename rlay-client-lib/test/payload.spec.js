/* eslint-env node, mocha */
const assert = require('assert');
const { Payload } = require('../src/payload');
const payloads = require('./assets/payloads');

async function assertThrowsAsync(fn, regExp) {
  let f = () => {};
  try { await fn(); } catch(e) { f = () => {throw e}; } finally {
    assert.throws(f, regExp);
  }
}


describe('Payload', () => {
  describe('constructor', () => {
    context('missing validator', () => {
      it('throws', () => {
        assert.throws(() => new Payload({}), /invalid validator function/u);
      });
    });

    context('valid payloadObject', () => {
      it('returns Payload instance', () => {
        const payload = new Payload(payloads.withCid, () => '123');
        assert.deepEqual(payload, payloads.withCid);
      });
    });

    context('invalid payloadObject', () => {
      it('throws', () => {
        assert.throws(() => new Payload({}, () => false), /invalid payload object/u);
      });
    });
  });

  describe('.clone', () => {
    it('returns a cloned Payload', () => {
      const originalPayload = new Payload(payloads.withCid, () => true);
      const clonedPayload = originalPayload.clone();
      originalPayload.type = 'changed type';
      assert.notEqual(clonedPayload.type, originalPayload.type);
    });

    it('returns a new Payload instance', () => {
      const originalPayload = new Payload(payloads.withCid, () => true);
      const clonedPayload = originalPayload.clone();
      assert.equal(clonedPayload instanceof Payload, true);
    });
  });

  describe('.removeCid', () => {
    it('removes the cid', () => {
      const payload = new Payload(payloads.withCid, () => true);
      payload.removeCid();
      assert.equal(payload.cid, undefined);
    });

    it('returns the removed cid', () => {
      const payload = new Payload(payloads.withCid, () => true);
      const payloadClone = payload.clone();
      const cid = payload.removeCid();
      assert.equal(cid, payloadClone.cid);
    });
  });

  describe('.removeType', () => {
    it('removes the type', () => {
      const payload = new Payload(payloads.withCid, () => true);
      payload.removeType();
      assert.equal(payload.type, undefined);
    });

    it('returns the removed type', () => {
      const payload = new Payload(payloads.withCid, () => true);
      const payloadClone = payload.clone();
      const type = payload.removeType();
      assert.equal(type, payloadClone.type);
    });
  });

  describe('.toJson', () => {
    it('returns plain JSON object', () => {
      const payload = new Payload(payloads.withCid, () => true);
      assert.deepEqual(payload.toJson(), payloads.withCid);
    });
  });

  describe('.decode', () => {
    context('missing decoder', () => {
      it('throws', () => {
        const payload = new Payload(payloads.dataPropertyAssertion, () => true);
        assert.throws(payload.decode, /invalid decoder/u);
      });
    });

    it('decodes the correct attributes', () => {
      const payload = new Payload(payloads.dataPropertyAssertion, () => true);
      payload.decode(() => 'abc');
      assert.equal(payload.target, 'abc');
    });
  });

  describe('.resolveCids', () => {
    context('missing resolver', () => {
      it('throws', async () => {
        const payload = new Payload(payloads.dataPropertyAssertion, () => true);
        await assertThrowsAsync(payload.resolveCids, /invalid resolver/u);
      });
    });

    const resolver = (cid) => {
      if (cid.slice(-4) === '7fe0') return 1
      if (cid.slice(-4) === 'eedd') return 2
      return 3
    }
    const resolvers = [
      { type: 'non-async', resolver},
      { type: 'async', resolver: async (cid) => resolver(cid) }
    ]
    resolvers.forEach(r => {
      context(`${r.type} resolver`, () => {
        it('resolves all CIDs', async () => {
          const specialPayload = payloads.clone(payloads.dataProperty);
          // add target and value to it to make sure it really works
          specialPayload.value = '0xfakevalue';
          specialPayload.target = '0xfaketarget';
          const payload = new Payload(specialPayload, () => true);

          const expected = {
            type: 'DataProperty',
            cid: 3,
            annotations: [1, 2],
            superDataPropertyExpression: [],
            value: '0xfakevalue',
            target: '0xfaketarget'
          }
          await payload.resolveCids(r.resolver);
          assert.deepEqual(payload.toJson(), expected);
        });
      });
    });
  });
});
