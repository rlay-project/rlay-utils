const { generateFnName } = require('./utils');

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

    //logger.info(`Stored ${this.urn.entityType}: ${this.name} (${this.cid})`);
    const entityCID = await this.client.createIndividual(entityValue);
    //logger.info(`Stored ${this.urn.entityType}: ${this.name} (${this.cid})`);
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
      assertionPromises.push(propertyFunction(individual, propertyValue));
    });

    //logger.info(`Stored ${this.urn.entityType}: ${this.name} (${this.cid})`);
    const assertionCIDs = await Promise.all(assertionPromises);
    //logger.info(`Stored ${this.urn.entityType}: ${this.name} (${this.cid})`);
    return assertionCIDs;
  }
}

module.exports = Individual;
