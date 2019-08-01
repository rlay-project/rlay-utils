const { ClientInterface } = require('./interfaces/client');
const { Payload } = require('./payload');
const check = require('check-types');
const { forEach } = require('p-iteration');
const VError = require('verror');

const filterByValidKeys = (obj, validKeys) => {
  return Object.keys(obj).filter(key => validKeys.includes(key)).
    reduce((newObj, key) => { newObj[key] = obj[key]; return newObj }, {});
}

const schemaTypeMapping = {
  'ClassAssertion': 'class_assertions',
  'DataPropertyAssertion': 'data_property_assertions',
  'ObjectPropertyAssertion': 'object_property_assertions',
};

const findEntityKey = (schema, cid) => {
  let searchResult = null;
  Object.keys(schema).forEach(key => {
    if (schema[key].cid === cid) {
      searchResult = key;
    }
  });
  return searchResult;
}

class SchemaPayload {
  constructor (client, payloadObject) {
    // setup client
    if (check.instance(client, ClientInterface)) {
      this.client = client;
    } else {
      const wrongType = new Error(`expected client to be instance of ClientInterface`)
      const invalidClient = new VError(wrongType, 'invalid client');
      throw new VError(invalidClient, 'failed to instantiate schema payload');
    }

    // validate payloadObject
    Object.keys(payloadObject).forEach(key => {
      const schemaAssertion = client[key];
      if (!schemaAssertion) {
        const propertyNotFound = new Error(`schema entity ${key} not found. Make sure it was seeded`)
        const invalidProperty = new VError(propertyNotFound, 'invalid payload object');
        throw new VError(invalidProperty, 'failed to instantiate schema payload');
      }
      // do; we should also check that the schemaAssertion is instanceof Entity
      return schemaAssertion;
    });
    this.payload = payloadObject;
  }

  static fromPayloads (client, payloads) {
    if (check.not.instance(client, ClientInterface)) {
      const wrongType = new Error(`expected client to be instance of ClientInterface`)
      const invalidClient = new VError(wrongType, 'invalid client');
      throw new VError(invalidClient, 'failed to instantiate schema payload from entity payloads');
    }
    if (check.not.array(payloads) || !check.all(payloads.map(check.object))) {
      const wrongType = new Error(`expected payloads to be an array of entity payloads objects`)
      const invalidClient = new VError(wrongType, 'invalid payloads input');
      throw new VError(invalidClient, 'failed to instantiate schema payload from entity payloads');
    }
    const schemaPayloadObject = payloads.
      map(payload => {
        const partialSchemaPayloadObject = {};
        if (payload.type === 'ClassAssertion') {
          // find schema Key
          const key = findEntityKey(client.schema, payload.class);
          partialSchemaPayloadObject[key] = true
        } else if (payload.type === 'DataPropertyAssertion') {
          // find schema Key
          const key = findEntityKey(client.schema, payload.property);
          partialSchemaPayloadObject[key] = client.rlay.decodeValue(payload.target)
        } else if (payload.type === 'ObjectPropertyAssertion') {
          // find schema Key
          const key = findEntityKey(client.schema, payload.property);
          const targetPayload = payloads.filter(p => p.cid === payload.target).pop();
          if (targetPayload) {
            const EntityFactory = client.getEntityFactoryFromPayload(targetPayload);
            partialSchemaPayloadObject[key] = new EntityFactory(client, targetPayload);
          } else {
            const propertyValueInvalid = new Error(`no object individual found for ${key}`);
            const invalidProperty = new VError(propertyValueInvalid, 'missing object individual');
            throw new VError(invalidProperty, 'failed to resolve individual');
          }
        }
        return partialSchemaPayloadObject;
      }).
      reduce((schemaPayloadObject, partialSchemaPayloadObject) => ({
        ...schemaPayloadObject,
        ...partialSchemaPayloadObject
      }), {});
    return new this(client, schemaPayloadObject);
  }

  toIndividualEntityPayload () {
    if (check.not.array(this.entities)) {
      const createdStatusError = new Error('expected `.create` to have been called on schema payload')
      const invalidError = new VError(createdStatusError, 'invalid schema payload status');
      throw new VError(invalidError, 'failed to create individual entity payload');
    }
    // do; we should extend Payload to create Entity specific payloads
    const newIndividualPayload = new Payload({
      "annotations": [],
      "class_assertions": [],
      "negative_class_assertions": [],
      "object_property_assertions": [],
      "negative_object_property_assertions": [],
      "data_property_assertions": [],
      "negative_data_property_assertions": [],
      "type": "Individual"
    }, () => true);
    // setup `entityValue`
    this.entities.forEach(entity => {
      const propertyType = schemaTypeMapping[entity.type];
      if (propertyType) {
        newIndividualPayload[propertyType].push(entity.remoteCid);
      }
    });
    return newIndividualPayload.toJson();
  }

  async create (options = {}) {
    const promises = []
    const validOptions = filterByValidKeys(options, ['subject']);
    await forEach(Object.keys(this.payload), async assertionKey => {
      const AssertionEntity = this.client[assertionKey];
      if (AssertionEntity.prototype instanceof this.client.Rlay_ClassAssertion) {
        promises.push(AssertionEntity.create(validOptions));
      }
      if (AssertionEntity.prototype instanceof this.client.Rlay_DataPropertyAssertion) {
        promises.push(AssertionEntity.create({
          ...validOptions,
          target: this.payload[assertionKey],
        }));
      }
      if (AssertionEntity.prototype instanceof this.client.Rlay_ObjectPropertyAssertion) {
        if (!(this.payload[assertionKey] instanceof this.client.Rlay_Individual)) {
          const propertyValueInvalid = new Error(`property ${assertionKey} not an individual entity`)
          const invalidProperty = new VError(propertyValueInvalid, 'invalid property value');
          throw new VError(invalidProperty, 'failed to create individual');
        }
        if (check.undefined(this.payload[assertionKey].remoteCid)) {
          await this.payload[assertionKey].create();
        }
        promises.push(AssertionEntity.create({
          ...validOptions,
          target: this.payload[assertionKey].remoteCid,
        }));
      }
    });
    this.entities = await Promise.all(promises);
    return this.entities;
  }
}

module.exports = { SchemaPayload }
