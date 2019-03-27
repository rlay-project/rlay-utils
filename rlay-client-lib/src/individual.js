const { generateFnName } = require('./utils');
const { UnknownEntityError } = require('./errors');
const logger = require('./logger')(__filename);

class Individual {
  constructor (client) {
    this.client = client;
  }

  /**
   * Creates an `Individual` with the provided inherent properties
   *
   * @param {Object} properties - The inherent properties of the individual
   * @returns {String} - The `CID` of the created `Individual`
   */
  async create (properties) {
    const propertyKeys = Object.keys(properties);
    const entityValue = {};
    const schemaTypeMapping = {
      'Class': 'class_assertions',
      'DataProperty': 'data_property_assertions',
      'ObjectProperty': 'object_property_assertions',
    };

    // eslint-disable-next-line no-undefined
    const propertyCIDs = await this.assert(properties, undefined);

    // setup `entityValue`
    propertyCIDs.forEach((cid, i) => {
      const propertyKey = propertyKeys[i];
      const schemaType = this.client.schema[propertyKey].type;
      const propertyType = schemaTypeMapping[schemaType];
      if (propertyType) {
        if (!entityValue[propertyType]) entityValue[propertyType] = [];
        entityValue[propertyType].push(cid);
      }
    });

    const start = Date.now();
    logger.debug(`Storing Individual (${start}) ...`);
    const entityCID = await this.client.createIndividual(entityValue);
    logger.debug(`Stored Individual (${start} -> ${entityCID}) in ${Date.now() - start}ms`);
    return entityCID;
  }

  /**
   * Create the data and object assertions for an `Individual`
   *
   * @param {Object} assertions - The non-inherent properties of the individual
   * @returns {String[]} - The `CID`s of the assertions
   */
  // eslint-disable-next-line no-undefined
  async assert (assertions, individual = undefined) {
    const assertionKeys = Object.keys(assertions);
    const assertionPromises = [];

    // setup `propertyPromises`
    assertionKeys.forEach(propertyKey => {
      const propertyValue = assertions[propertyKey];
      const propertyFunctionName = `assert${generateFnName(propertyKey)}`;
      const propertyFunction = this.client[propertyFunctionName];
      if (propertyFunction instanceof Function) {
        assertionPromises.push(propertyFunction(individual, propertyValue));
      } else {
        throw new UnknownEntityError(
          `No schema entity exists for: '${propertyKey}'. Make sure you seeded it.`
        );
      }
    });

    const start = Date.now();
    logger.debug(`Storing Entity/ies (${start}) ...`);
    const assertionCIDs = await Promise.all(assertionPromises);
    logger.debug(`Stored Entity/ies (${start} -> ${assertionCIDs}) in ${Date.now() - start}ms`);
    return assertionCIDs;
  }
}

module.exports = Individual;
