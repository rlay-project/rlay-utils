const check = require('check-types');
const VError = require('verror');
const { forEach, map } = require('p-iteration');

const ENCODE_KEYS = ['value', 'target'];

class Payload {
  constructor (payloadObject, validatorFn) {
    if (!check.function(validatorFn)) {
      const expected = new Error('expected validatorFn to be a function');
      throw new VError(expected, 'invalid validator function');
    }

    // check if payloadObject is valid
    try {
      const result = validatorFn(payloadObject);
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
