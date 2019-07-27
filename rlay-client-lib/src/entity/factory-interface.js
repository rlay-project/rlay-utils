const logger = require('../logger')(__filename);
const { Mixin } = require('mixwith');

/**
 * The Factory Interface Class for Entity classes (static methods)
 * Not meant to be used by itself. Use `Entity` instead.
 *
 * @class
 * @author Michael Hirn <michael.j.hirn+rlay[]gmail.com>
 */
const EntityFactoryInterface = Mixin((superclass) => class extends superclass {

  /**
   * Create a new `Entity`. Calls out to the Rlay Server
   *
   * @async
   * @static
   *
   * @param {object} params
   * @returns {Entity|Error}
   */
  static async create (params = {}) {
    const start = Date.now();
    logger.debug(`Storing Individual (${start}) ...`);
    const cid = await this.client.createEntity(this.prepareRlayFormat(params));
    logger.debug(`Stored Individual (${start} -> ${cid}) in ${Date.now() - start}ms`);
    return new this(this.client, this.prepareRlayFormat(params), cid);
  }

  static prepareRlayFormat (params = {}) {
    const format = { };
    this.fields.forEach(field => {
      if (params[field] === undefined) {
        if ((this.fieldsDefault || {})[field] === undefined) {
          format[field] = undefined
        } else {
          format[field] = (this.fieldsDefault || {})[field]
        }
      } else {
        format[field] = params[field]
      }
    });
    format.type = this.type;
    return format;
  }

  /**
   * Find an `Entity` by its `CID`. Calls out to the Rlay Server.
   * Returns an `Entity` instance.
   *
   * @async
   * @static
   *
   * @example <caption>Find an Entity</caption>
   * ```javascript
   * const entity = await Entity.find('123...789');
   * (entity && entity instanceof Entity) // returns true
   * // assuming that the CID `123...789` belongs to a DataPropertyAssertion
   * (entity instanceof Rlay_DataPropertyAssertion) // returns true
   * ```
   *
   * @param {string} cid - The `CID` that should be looked for
   * @param {boolean} fetchBoolean - If .fetch() should be called on the new entity
   * @returns {Entity|null} - Return `null` if no entity was found
   */
  static async find (cid, fetchBoolean = false) {
    if (typeof cid === 'string') {
      const start = Date.now();
      logger.debug(`Finding Entity (${start}) ...`);
      const result = await this.client.findEntityByCID(cid);
      logger.debug(`Finding Entity Result (${start} -> ${cid}) in ${Date.now() - start}ms`);
      if (result !== null) {
        const EntityClass = this.client[`Rlay_${result.type}`];
        const entity = new EntityClass(this.client, result);
        if (fetchBoolean) {
          await entity.fetch();
        }
        return entity;
      }
      return null;
    }
  }

  static get intermediate () {
    // If `_foo` is inherited or doesn't exist yet, treat it as `undefined`
    return this.hasOwnProperty('_intermediate') ? this._intermediate : void 0;
  }

  static set intermediate (intermediate) {
    this._intermediate = intermediate;
  }

  static get client () {
    // If `_foo` is inherited or doesn't exist yet, treat it as `undefined`
    return this.hasOwnProperty('_client') ? this._client : void 0;
  }

  static set client (client) {
    this._client = client;
  }

  static get type () {
    // If `_foo` is inherited or doesn't exist yet, treat it as `undefined`
    return this.hasOwnProperty('_type') ? this._type : void 0;
  }

  static set type (type) {
    this._type = type;
  }

  static get fields () {
    // If `_foo` is inherited or doesn't exist yet, treat it as `undefined`
    return this.hasOwnProperty('_fields') ? this._fields : void 0;
  }

  static set fields (fields) {
    this._fields = fields;
  }

  static get fieldsDefault () {
    // If `_foo` is inherited or doesn't exist yet, treat it as `undefined`
    const fieldName = '_fieldsDefault';
    if (Object.prototype.hasOwnProperty.call(this, fieldName)) {
      return this[fieldName];
    }
    return void 0;
  }

  static set fieldsDefault (defaultValue) {
    this._fieldsDefault = defaultValue;
  }
});

module.exports = EntityFactoryInterface;
