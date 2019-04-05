const EntityInterface = require('./interface');
const logger = require('../logger')(__filename);

class EntityFactoryInterface extends EntityInterface {
  static async create (params = {}) {
    const start = Date.now();
    logger.debug(`Storing Individual (${start}) ...`);
    const cid = await this.client.createEntity(this.prepareRlayFormat(params));
    logger.debug(`Stored Individual (${start} -> ${cid}) in ${Date.now() - start}ms`);
    return new this(this.client, this.prepareRlayFormat(params), cid);
  }

  static prepareRlayFormat (params = {}) {
    if (!this.fields) return new Error(`Fields not set for ${this}`);
    const format = { };
    this.fields.forEach(field => {
      format[field] = (
        params[field] || (this.fieldsDefault || {})[field] || []
      );
    });
    format.type = this.type;
    return format;
  }

  static async find (cid) {
    if (typeof cid === 'string') {
      const start = Date.now();
      logger.debug(`Finding Entity (${start}) ...`);
      const resultCID = await this.client.findEntityByCID(cid);
      logger.debug(`Finding Entity Result (${start} -> ${cid}) in ${Date.now() - start}ms`);
      return new this(this.client, {}, resultCID);
    }
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
}

module.exports = EntityFactoryInterface;
