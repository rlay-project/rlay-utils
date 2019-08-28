const Entity = require('../entity/entity');
const { SchemaPayload } = require('../schemaPayload');
const VError = require('verror');
const check = require('check-types');
const queries = require('../cypherQueries');
const debug = require('../debug').extend('entity');

class Rlay_Individual extends Entity {
  static async create (schemaPayloadObject = {}) {
    try {
      const schemaPayload = new SchemaPayload(this.client, schemaPayloadObject);
      await schemaPayload.create();
      return super.create(schemaPayload.toIndividualEntityPayload());
    } catch (e) {
      const invalidProperty = new VError(e, 'invalid schema payload object');
      throw new VError(invalidProperty, 'failed to create individual');
    }
  }

  /**
   * Create the class, data, object, and other assertions for an `Individual`
   *
   * @async
   * @param {Object} assertions - The non-inherent properties of the individual
   * @returns {String[]} - The `CID`s of the assertions
   */
  async assert (assertions) {
    debug.extend(`assert${this.type}`)(`...${this.cid.slice(-8)}`);
    if(check.undefined(this.remoteCid)) {
      const notObject = new Error('expected individual to be a remote entity and have a .remoteCid. Make sure you created the individual');
      const invalidInput = new VError(notObject, 'invalid individual');
      throw new VError(invalidInput, 'failed to create assertions');
    }
    try {
      const schemaPayload = new SchemaPayload(this.client, assertions);
      const result = await schemaPayload.create({subject: this.remoteCid});
      return result;
    } catch (e) {
      const invalidProperty = new VError(e, 'invalid schema payload object input');
      throw new VError(invalidProperty, 'failed to create assertions');
    }
  }

  async resolve () {
    const [propertyPayloads, assertionPayloads] = await Promise.all(
      [
        this.client.findEntityByCypher(queries.
          individualResolve(this, 'properties')),
        this.client.findEntityByCypher(queries.
          individualResolve(this, 'assertions')),
      ]
    );
    Object.assign(
      this,
      {
        properties: SchemaPayload.fromPayloads(this.client, propertyPayloads).payload,
        ...SchemaPayload.fromPayloads(this.client, assertionPayloads).payload
      },
    );
    return this;
  }

  static async findByAssertion (assertion) {
    const schemaPayload = new SchemaPayload(this.client, assertion);
    const assertionEntity = schemaPayload.schemaAssertions[0];
    const [propertyPayloads, assertionPayloads] = await Promise.all(
      [
        this.client.findEntityByCypher(queries.
          individualsByEntityAssertion(assertionEntity, 'properties')),
        this.client.findEntityByCypher(queries.
          individualsByEntityAssertion(assertionEntity, 'assertions')),
      ]
    );
    return {
      asProperty: propertyPayloads.map(payload => this.client.getEntityFromPayload(payload)),
      asAssertion: assertionPayloads.map(payload => this.client.getEntityFromPayload(payload))
    }
  }
}

module.exports = Rlay_Individual;
