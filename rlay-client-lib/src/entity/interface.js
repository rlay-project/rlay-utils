const { UnknownEntityError } = require('../errors');
const logger = require('../logger')(__filename);

class EntityInterface {
  constructor (client, payload, cid) {
    this.client = client;
    this.payload = payload;
    this.type = this.payload.type;
    this.cid = cid;
  }

  /**
   * Create the class, data, object, and other assertions for an `Individual`
   *
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
}

module.exports = EntityInterface;
