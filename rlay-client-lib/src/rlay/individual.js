const Entity = require('../entity/entity');
const VError = require('verror');
const check = require('check-types');
const { forEach } = require('p-iteration');
const debug = require('../debug').extend('entity');

const schemaTypeMapping = {
  'ClassAssertion': 'class_assertions',
  'DataPropertyAssertion': 'data_property_assertions',
  'ObjectPropertyAssertion': 'object_property_assertions',
};

const generateQuery = (subjectCID, relType) => {
   //const queryOPA = `${_queryBase}-(m:ObjectPropertyAssertion)-[:target]-(o) WITH m.cid + COLLECT(o.cid) AS cids UNWIND cids AS cid RETURN DISTINCT cid`;
  let whereClause = 'type(r) = "subject"';
  if (relType === 'properties') {
    whereClause = 'NOT type(r) = "subject"';
  }
  return `
    MATCH
      (n:RlayEntity {cid: "${subjectCID}"})-[r]-(m:RlayEntity)
    WHERE
      ${whereClause}
    OPTIONAL MATCH
      (m:RlayEntity)-[:target]-(o:RlayEntity)
    WITH
      m.cid + COLLECT(o.cid) AS cids
    UNWIND cids AS cid
    RETURN DISTINCT cid
  `;
}

const findEntityKey = (schema, cid) => {
  let searchResult = null;
  Object.keys(schema).forEach(key => {
    if (schema[key].cid === cid) {
      searchResult = key;
    }
  });
  return searchResult;
}

class Rlay_Individual extends Entity {
  static async create (properties = {}) {
    const propertyKeys = Object.keys(properties);
    const propertyEntityPromises = [];
    const entityValue = {};

    await forEach(propertyKeys, async propertyName => {
      const EntityFactory = this.client[propertyName];
      if (!EntityFactory) {
        const propertyNotFound = new Error(`property ${propertyName} not found. Make sure it was seeded`)
        const invalidProperty = new VError(propertyNotFound, 'invalid property');
        throw new VError(invalidProperty, 'failed to create individual');
      }
      if (EntityFactory.prototype instanceof this.client.Rlay_ClassAssertion) {
        propertyEntityPromises.push(EntityFactory.create());
      }
      if (EntityFactory.prototype instanceof this.client.Rlay_DataPropertyAssertion) {
        propertyEntityPromises.push(EntityFactory.create({
          target: properties[propertyName]
        }));
      }
      if (EntityFactory.prototype instanceof this.client.Rlay_ObjectPropertyAssertion) {
        if (!(properties[propertyName] instanceof this.client.Rlay_Individual)) {
          const propertyValueInvalid = new Error(`property ${propertyName} not an individual entity`)
          const invalidProperty = new VError(propertyValueInvalid, 'invalid property value');
          throw new VError(invalidProperty, 'failed to create individual');
        }
        if (check.undefined(properties[propertyName].remoteCid)) {
          await properties[propertyName].create();
        }
        propertyEntityPromises.push(EntityFactory.create({
          target: properties[propertyName].remoteCid
        }));
      }
    });

    const propertyEntities = await Promise.all(propertyEntityPromises);

    // setup `entityValue`
    propertyEntities.forEach(entityInstance => {
      const propertyType = schemaTypeMapping[entityInstance.type];
      if (propertyType) {
        if (!entityValue[propertyType]) entityValue[propertyType] = [];
        entityValue[propertyType].push(entityInstance.cid);
      }
    });

    return super.create(entityValue);
  }

  _createPretty (payloads) {
    const resultObj = {};
    payloads.forEach(payload => {
      if (payload.type === 'ClassAssertion') {
        // find schema Key
        const entityKey = findEntityKey(this.client.schema, payload.class);
        resultObj[entityKey] = true;
      } else if (payload.type === 'DataPropertyAssertion') {
        // find schema Key
        const entityKey = findEntityKey(this.client.schema, payload.property);
        resultObj[entityKey] = this.client.rlay.decodeValue(payload.target)
      } else if (payload.type === 'ObjectPropertyAssertion') {
        // find schema Key
        const entityKey = findEntityKey(this.client.schema, payload.property);
        const target = payloads.filter(p => p.cid === payload.target).pop();
        if (target) {
          const EntityClass = this.client[`Rlay_${target.type}`];
          resultObj[entityKey] = new EntityClass(this.client, target);
        } else {
          const propertyValueInvalid = new Error(`no object individual found for ${entityKey}`);
          const invalidProperty = new VError(propertyValueInvalid, 'missing object individual');
          throw new VError(invalidProperty, 'failed to resolve individual');
        }
      }
    });
    return resultObj;
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
    if(!check.object(assertions)) {
      const notObject = new Error('expected input to be an object.');
      const invalidInput = new VError(notObject, 'invalid input');
      throw new VError(invalidInput, 'failed to create assertion');
    }
    if(check.undefined(this.remoteCid)) {
      const notObject = new Error('expected individual to be a remote entity and have a .remoteCid. Make sure you created the individual');
      const invalidInput = new VError(notObject, 'invalid individual');
      throw new VError(invalidInput, 'failed to create assertion');
    }
    const assertionKeys = Object.keys(assertions);
    const assertionPromises = [];

    await forEach(assertionKeys, async propertyName => {
      const EntityFactory = this.client[propertyName];
      if (!EntityFactory) {
        const propertyNotFound = new Error(`property ${propertyName} not found. Make sure it was seeded`)
        const invalidProperty = new VError(propertyNotFound, 'invalid property');
        throw new VError(invalidProperty, 'failed to create assertion');
      }
      if (EntityFactory.prototype instanceof this.client.Rlay_ClassAssertion) {
        assertionPromises.push(EntityFactory.create({
          subject: this.cid,
        }));
      }
      if (EntityFactory.prototype instanceof this.client.Rlay_DataPropertyAssertion) {
        assertionPromises.push(EntityFactory.create({
          subject: this.cid,
          target: assertions[propertyName]
        }));
      }
      if (EntityFactory.prototype instanceof this.client.Rlay_ObjectPropertyAssertion) {
        if (!(assertions[propertyName] instanceof this.client.Rlay_Individual)) {
          const propertyValueInvalid = new Error(`property ${propertyName} not an individual entity`)
          const invalidProperty = new VError(propertyValueInvalid, 'invalid property value');
          throw new VError(invalidProperty, 'failed to create assertion');
        }
        if (check.undefined(assertions[propertyName].remoteCid)) {
          await assertions[propertyName].create();
        }
        assertionPromises.push(EntityFactory.create({
          subject: this.cid,
          target: assertions[propertyName].remoteCid
        }));
      }
    });

    return Promise.all(assertionPromises);
  }

  async resolve () {
    const [propertyPayloads, assertionPayloads] = await Promise.all([
      this.client.findEntityByCypher(generateQuery(this.cid, 'properties')),
      this.client.findEntityByCypher(generateQuery(this.cid, 'assertions')),
    ]);
    Object.assign(
      this,
      {
        properties: this._createPretty(propertyPayloads),
        ...this._createPretty(assertionPayloads)
      },
    );
    return this;
  }
}

module.exports = Rlay_Individual;
