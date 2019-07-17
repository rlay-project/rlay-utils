const { UnknownEntityError } = require('../errors');
const logger = require('../logger')(__filename);
const objectPath = require('object-path');
const VError = require('verror');

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
   * @param {object} payload - the `EntityObject` that the `CID` represents
   */
  constructor (client, payload) {
    this.client = client;
    this._cidRemote = payload.cid;
    this.payload = payload;
    this.type = this.payload.type;
    try {
      this.cid = client.getEntityCid(this.payload);
    } catch (e) {
      throw new VError(e, 'Invalid Payload: "%s"', JSON.stringify(this.payload));
    }
  }

  set payload (payload) {
    Reflect.deleteProperty(payload, 'cid');
    this._payload = payload;
  }

  get payload () {
    return this._payload;
  }

  /**
   * Create the class, data, object, and other assertions for an `Individual`
   *
   * @async
   * @param {Object} assertions - The non-inherent properties of the individual
   * @returns {String[]} - The `CID`s of the assertions
   */
  async assert (assertions = {}) {
    const assertionKeys = Object.keys(assertions);
    const assertionPromises = [];

    assertionKeys.forEach(propertyName => {
      if (this.client[propertyName]) {
        assertionPromises.push(
          this.client[propertyName].create({subject: this.cid})
        );
      } else {
        throw new UnknownEntityError(
          `No schema entity exists for: '${propertyName}'. Make sure you seeded it.`
        );
      }
    });

    const start = Date.now();
    logger.debug(`Storing Assertion(s) (${start}) ...`);

    const assertionEntities = await Promise.all(assertionPromises);
    const CIDs = assertionEntities.map(e => e.cid);

    logger.debug(`Stored Assertion(s) (${start} -> ${CIDs}) in ${Date.now() - start}ms`);
    return assertionEntities;
  }

  /**
   * Manages a payload key e.g. annotations, target, or subject etc. and
   * either finds (resolves) the CID or decodes the value/target.
   *
   * @return [Array<Array<string, Object>>] - Array of Array with path and Object
   */
  _schemaKeyHandler (schemaKey, schema, find, decodeValue) {
    if (schema[schemaKey] instanceof Array) {
      // is array of CIDs
      return schema[schemaKey].map((element, i) => {
        return [`${schemaKey}.${i}`, find(element)];
      });
    } else if(['value', 'target'].includes(schemaKey)) {
      // is encoded value
      return [schemaKey, decodeValue(schema[schemaKey])];
    }
    // is CID
    return [schemaKey, find(schema[schemaKey])];
  }

  /**
   * Given the payload of the entity it fetches the related entities and instantiates
   * proper `Entities` from them.
   *
   * @async
   */
  async fetch () {
    const { type, cid, ...schema } = this.payload;
    // get the schema jobs
    const schemaJobs = [...Object.keys(schema).map(schemaKey => {
      return this._schemaKeyHandler(
        schemaKey,
        schema,
        this.client.Individual.find.bind(this.client.Individual),
        this.client.rlay.decodeValue.bind(this.client.rlay)
      );
    })];
    // split the jobs
    const schemaPath = schemaJobs.map(job => job[0]);
    const schemaPromiseResults = await Promise.all(schemaJobs.map(job => job[1]));
    // attach the handled payload to the entity instance
    schemaPath.forEach((path, i) => {
      objectPath.set(this, path, schemaPromiseResults[i]);
    });
  }
}

module.exports = EntityInterface;
