const check = require('check-types');
const VError = require('verror');
const { forEach, map } = require('p-iteration');
const { findAndReplace } = require('find-and-replace-anything');

const ENCODE_KEYS = ['value', 'target'];

class Payload {
  constructor (payloadObject, validatorFn) {
    if (!check.function(validatorFn)) {
      const expected = new Error('expected validatorFn to be a function');
      throw new VError(expected, 'invalid validator function');
    }

    // check if payloadObject is valid
    try {
      // we clone and remove the cid from clone
      const payloadClone = {};
      Object.assign(payloadClone, payloadObject);
      Reflect.deleteProperty(payloadClone, 'cid');
      const result = validatorFn(payloadClone);
      if (result === false) throw new Error('validator function returned false');
    } catch (e) {
      const payloadError = new VError(e,
        'invalid payload object: "%s"', JSON.stringify(payloadObject));
      throw new VError(payloadError, 'failed to validate payload object');
    }

    Object.assign(this, payloadObject);
  }

  clone () {
    const payloadObject = JSON.parse(JSON.stringify(this));
    return new Payload(payloadObject, () => true);
  }

  toJson () {
    return JSON.parse(JSON.stringify(this));
  }

  removeCid () {
    const cid = this.cid;
    Reflect.deleteProperty(this, 'cid');
    return cid;
  }

  removeType () {
    const type = this.type;
    Reflect.deleteProperty(this, 'type');
    return type;
  }

  decode (decoder) {
    // validate decoder
    if (!check.function(decoder)) {
      const expected = new Error('expected decoder to be a function');
      throw new VError(expected, 'invalid decoder');
    }

    // decode
    const payloadKeys = Object.keys(this);
    const decodeKeys = payloadKeys.filter(key => ENCODE_KEYS.includes(key));
    decodeKeys.forEach(key => {
      this[key] = decoder(this[key]);
    });

    return this;
  }

  static getPayloadFromPayloadsByCid (cid, payloads) {
    try {
      check.assert.string(cid, 'invalid input; expected cid to be a string');
      check.assert.array(payloads, 'invalid input; expected payloads to be an array');
      check.assert.equal(check.all(
        check.map(payloads, (payload) => check.instanceStrict(payload, Payload))),
        true, 'invalid input; expected payload to be an array of Payload instances');
      const filteredPayloads = payloads.filter(payload => payload.cid === cid);
      if (filteredPayloads.length === 0) return null;
      return filteredPayloads[0];
    } catch (e) {
      throw new VError(e, 'failed to exectue getPayloadFromPayloadsByCid');
    }
  }

  getCidAttributes () {
    try {
      return Object.keys(this).filter(attribute => {
        if (attribute === 'cid') return false
        if (attribute === 'type') return false
        if (attribute === 'value') return false
        if (attribute === 'target' && !this.type.includes('ObjectPropertyAssertion')) {
          return false
        }
        return true
      })
    } catch (e) {
      throw new VError(e, 'failed to exectue getCidAttributes');
    }
  }

  replaceValues (findReplace) {
    try {
      check.assert.array(findReplace, 'invalid input; expected findReplace to be an array');
      check.assert.equal(check.all(check.map(findReplace, check.array)), true,
        'invalid input; expected findReplace to be an array of arrays');
      check.assert.equal(check.all(check.map(findReplace, (arr) => arr.length === 2)), true,
        'invalid input; expected findReplace to be an array of arrays with length 2');
      let findAndReplaceResult = this.toJson();
      findReplace.forEach(([find, replace]) => {
        findAndReplaceResult = findAndReplace(findAndReplaceResult, find, replace, {onlyPlainObjects: true});
      });
      Object.assign(this, findAndReplaceResult);
      return this;
    } catch (e) {
      throw new VError(e, 'failed to exectue replaceValues');
    }
  }

  getCids () {
    const cidAttributes = this.getCidAttributes();
    const cids = [];
    cidAttributes.forEach(cidAttribute => {
      if (check.array(this[cidAttribute])) {
        cids.push(...this[cidAttribute]);
      } else {
        cids.push(this[cidAttribute]);
      }
    });
    return cids;
  }

  static getPayloadTypesFromPayloads(cid, payloads) {
    try {
      check.assert.string(cid, 'invalid input; expected cid to be a string');
      check.assert.array(payloads, 'invalid input; expected payloads to be an array');
      check.assert.equal(check.all(
        check.map(payloads, (payload) => check.instanceStrict(payload, Payload))),
        true, 'invalid input; expected payload to be an array of Payload instances');
      const filteredPayloads = payloads.filter(payload => payload.cid === cid);
      check.assert.equal(filteredPayloads.length, 1,
        `expected to find main payload but found ${filteredPayloads.length}`);
      return filteredPayloads[0];
    } catch (e) {
      throw new VError(e, 'failed to exectue getPayloadFromPayloadsByCid');
    }
  }

  static toResolvedPayload (cid, payloads, options) {
    try {
      check.assert.string(cid, 'invalid input; expected cid to be a string');
      check.assert.array(payloads, 'invalid input; expected payloads to be an array');
      check.assert.equal(check.all(
        check.map(payloads, (payload) => check.instanceStrict(payload, Payload))),
        true, 'invalid input; expected payload to be an array of Payload instances');
      const mainPayload = Payload.getPayloadFromPayloadsByCid(cid, payloads);
      const mainPayloadCids = mainPayload.getCids();
      const findAndReplaceInput = mainPayloadCids.map(mainPayloadCid => {
        const foundPayload = Payload.getPayloadFromPayloadsByCid(mainPayloadCid, payloads);
        return [
          mainPayloadCid,
          /* eslint-disable-next-line no-ternary, multiline-ternary */
          foundPayload ? options.getEntityFromPayload(foundPayload) : null
        ];
      });
      mainPayload.decode(options.decoder);
      mainPayload.removeType();
      mainPayload.removeCid();
      return mainPayload.replaceValues(findAndReplaceInput);
      //return mainPayload;
    } catch (e) {
      throw new VError(e, 'failed to exectue toResolvedPayload');
    }
  }

  /**
   * Resolve all present CIDs. Works with async and non-async resolvers
   */
  async resolveCids (resolver) {
    // validate resolver
    if (!check.function(resolver)) {
      const expected = new Error('expected resolver to be a function');
      throw new VError(expected, 'invalid resolver');
    }

    // resolve
    const payloadKeys = Object.keys(this);
    const decodeKeys = payloadKeys.filter(key => ![...ENCODE_KEYS, 'type'].includes(key));
    await forEach(decodeKeys, async key => {
      if (check.array(this[key])) {
        if (!check.emptyArray(this[key])) {
          /* eslint-disable-next-line require-atomic-updates */
          this[key] = await map(this[key], async element => resolver(element));
        }
      } else {
        /* eslint-disable-next-line require-atomic-updates */
        this[key] = await resolver(this[key]);
      }
    });

    return this;
  }
}

module.exports = { Payload }
