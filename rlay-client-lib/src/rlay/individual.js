const Entity = require('../entity/entity');
const check = require('check-types');
const debug = require('debug')('rlayClientLib:Individual');

const schemaTypeMapping = {
  'ClassAssertion': 'class_assertions',
  'DataPropertyAssertion': 'data_property_assertions',
  'ObjectPropertyAssertion': 'object_property_assertions',
};

const generateQuery = (subjectCID, relType) => {
   //const queryOPA = `${_queryBase}-(m:ObjectPropertyAssertion)-[:target]-(o) WITH m.cid + COLLECT(o.cid) AS cids UNWIND cids AS cid RETURN DISTINCT cid`;
  let whereClause = 'type(r) = "subject"';
  if (relType === 'properties') {
    whereClause = 'type(r) <> "subject"';
  }
  return `
    MATCH
      (n:RlayEntity {cid: "${subjectCID}"})-[r]-(m:RlayEntity)
    OPTIONAL MATCH
      (m:RlayEntity)-[:target]-(o:RlayEntity)
    WHERE
      ${whereClause}
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
    const debugMethod = debug.extend('create');
    const propertyKeys = Object.keys(properties);
    const propertyEntityPromises = [];
    const entityValue = {};
    debugMethod('called with properties %O', properties);

    propertyKeys.forEach(propertyName => {
      if (this.client[propertyName]) {
        propertyEntityPromises.push(this.client[propertyName].create());
      }
    });

    debugMethod('called with property keys %O', propertyKeys);

    const propertyEntities = await Promise.all(propertyEntityPromises);
    debugMethod('created propery entities %O', propertyEntities.map(e => e.payload.class));

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
          resultObj[entityKey] = new EntityClass(this.client, target, target.cid);
        } else {
          resultObj[entityKey] = target;
        }
      }
    });
    return resultObj;
  }

  async fetch () {
    const [propertyPayloads, assertionPayloads] = await Promise.all([
      this.client.findEntityByCypher(generateQuery(this.cid, 'properties')),
      this.client.findEntityByCypher(generateQuery(this.cid, 'assertions')),
    ]);
    Object.assign(
      this,
      Object.assign(
        { properties: this._createPretty(propertyPayloads) },
        this._createPretty(assertionPayloads)
      )
    );
    return this;
  }
}

module.exports = Rlay_Individual;
