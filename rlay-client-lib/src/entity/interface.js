const { ClientInterface } = require('../interfaces/client');
const { Payload } = require('../payload');
const check = require('check-types');
const VError = require('verror');
const debug = require('../debug').extend('entity');

/**
 * Interface Class for Entity instances (non-static methods)
 * Not meant to be used by itself. Use `Entity` instead.
 *
 * @class
 * @author Michael Hirn <michael.j.hirn+rlay[]gmail.com>
 */
class EntityInterface {

  /**
   * Create a new EntityInterface instance
   *
   * @param {Client} client - a `Client` instance
   * @param {object} payloadObject - the `EntityObject` that the `CID` represents
   */
  constructor (client, payloadObject) {
    // setup client for this entity instance
    if (check.instance(client, ClientInterface)) {
      this.client = client;
    } else {
      throw new Error('invalid client. expected client to be instance of ClientInterface');
    }

    // setup payload
    const payload = new Payload(payloadObject, () => true);
    this.remoteCid = payload.removeCid();
    try {
      this.payload = new Payload(payload.toJson(), this.client.getEntityCid.bind(this.client));
    } catch (e) {
      throw new VError(e, 'failed to create new entity');
    }
    this.cid = this.client.getEntityCid(this.payload);

    // throw error if there is weird cid mismatch
    if (check.not.undefined(this.remoteCid) && this.remoteCid !== this.cid) {
      const remoteCid = `remoteCid(${this.remoteCid})`;
      const payloadCid = `payloadCid(${this.cid})`;
      const cidMismatchError = new Error(`mismatch ${remoteCid} <> ${payloadCid}`);
      const invalidCidsError = new VError(cidMismatchError, 'invalid cids');
      throw new VError(invalidCidsError, 'failed to instantiate new entity');
    }

    // debug and log
    if (check.not.undefined(this.remoteCid)) {
      debug.extend(`newRemote${this.type}`)(this.remoteCid);
    } else {
      debug.extend(`newLocal${this.type}`)(this.cid);
    }
  }

  set payload (payload) {
    this._payload = payload;
  }

  get payload () {
    return this._payload;
  }

  set remoteCid (cid) {
    this._remoteCid = cid;
  }

  get remoteCid () {
    return this._remoteCid;
  }

  get type () {
    return this.payload.type;
  }

  /**
   * Create the entity on the server by sending its payload
   *
   * @async
   * @returns {Promise<String>|Error} - Resolves to the CID of the entities payload
   */
  async create () {
    const cid = await this.client.createEntity(this.payload);
    this.remoteCid = cid;
    debug.extend(`create${this.type}`)(`...${this.remoteCid.slice(-8)}`);
    return this.remoteCid;
  }

  /**
   * Given the payload of the entity it fetches the related entities and instantiates
   * proper `Entities` from them.
   *
   * @async
   */
  async resolve () {
    /* eslint-disable-next-line no-unused-vars */
    const decoder = this.client.rlay.decodeValue.bind(this.client.rlay);
    const resolver = this.client.Entity.find.bind(this.client.Entity);
    const resolvedPayload = await this.payload.clone().
      decode(decoder).
      resolveCids(resolver);
    resolvedPayload.removeType();
    Object.assign(this, resolvedPayload);
    debug.extend(`resolve${this.type}`)(`...${this.remoteCid.slice(-8)}`);
    return this;
  }

  async fetch () {
    console.warn('DEPRECATED: use `.resolve`. `.fetch` will be retired in the next minor release');
    return this.resolve();
  }
}

module.exports = EntityInterface;
