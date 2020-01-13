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
    const payloads = await this.client.resolveEntity(this.cid);
    const entityPayloads = payloads[this.cid].filter(payload => {
      return payload.cid === this.cid
    });
    if (entityPayloads.length !== 1) {
      throw new Error(
        `unable to complete resolve; expected to find main payload but found ${entityPayloads.length}`);
    }
    const entityPayload = entityPayloads[0];
    // find all property cids
    const invalidKeys = ['type', 'cid'];
    const propertyCids = Object.keys(entityPayload).map(key => {
      if (invalidKeys.includes(key)) return []
      return entityPayload[key];
    }).reduce((all, one) => all.concat(one), []);
    // find all payloads associated with these propertyCids
    const propertyPayloads = [];
    const assertionPayloads = [];
    payloads[this.cid].forEach(payload => {
      if (this.cid !== payload.cid) {
        if (propertyCids.includes(payload.cid)) {
          propertyPayloads.push(payload);
        } else {
          assertionPayloads.push(payload);
        }
      }
    });
    Object.assign(
      this,
      {
        properties: SchemaPayload.fromPayloads(this.client, propertyPayloads).payload,
        ...SchemaPayload.fromPayloads(this.client, assertionPayloads).payload
      },
    );
    return this;
  }

  async resolveFallback () {
    const [propertyPayloads, assertionPayloads] = await Promise.all(
      [
        this.client.findEntityByCypher(queries.individualResolve(this, 'properties')),
        this.client.findEntityByCypher(queries.individualResolve(this, 'assertions')),
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
    const assertionEntities = schemaPayload.schemaAssertions;
    const [propertyPayloads, assertionPayloads] = await Promise.all(
      [
        this.client.findEntityByCypher(queries.
          individualsByEntityAssertion(assertionEntities, 'properties')),
        this.client.findEntityByCypher(queries.
          individualsByEntityAssertion(assertionEntities, 'assertions')),
      ]
    );
    return {
      asProperty: propertyPayloads.map(payload => this.client.getEntityFromPayload(payload)),
      asAssertion: assertionPayloads.map(payload => this.client.getEntityFromPayload(payload))
    }
  }
}

module.exports = Rlay_Individual;
