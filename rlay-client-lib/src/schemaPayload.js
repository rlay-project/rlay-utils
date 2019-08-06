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
        if (payload.type.slice(-14) === 'ClassAssertion') {
          // find schema Key
          const key = findEntityKey(client.schema, payload.class);
          if (payload.type.slice(0, 8) === 'Negative') {
            partialSchemaPayloadObject[key] = client.negative(true);
          } else {
            partialSchemaPayloadObject[key] = true
          }
        } else if (payload.type.slice(-21) === 'DataPropertyAssertion') {
          // find schema Key
          const key = findEntityKey(client.schema, payload.property);
          if (payload.type.slice(0, 8) === 'Negative') {
            partialSchemaPayloadObject[key] = client.negative(
              client.rlay.decodeValue(payload.target));
          } else {
            partialSchemaPayloadObject[key] = client.rlay.decodeValue(payload.target);
          }
        } else if (payload.type.slice(-23) === 'ObjectPropertyAssertion') {
          // find schema Key
          const key = findEntityKey(client.schema, payload.property);
          const targetPayload = payloads.filter(p => p.cid === payload.target).pop();
          if (targetPayload) {
            const EntityFactory = client.getEntityFactoryFromPayload(targetPayload);
            if (payload.type.slice(0, 8) === 'Negative') {
              partialSchemaPayloadObject[key] = client.negative(
                new EntityFactory(client, targetPayload));
            } else {
              partialSchemaPayloadObject[key] = new EntityFactory(client, targetPayload);
            }
          } else {
            const noObjIndi = new Error(`no object individual with cid ${payload.target} found in provided payloads for ${key}`);
            const invalidProperty = new VError(noObjIndi, 'missing object individual');
            throw new VError(invalidProperty, 'failed to resolve individual');
          }
        }
        return partialSchemaPayloadObject;
      }).
      reduce((schemaPayloadObject, partialSchemaPayloadObject) => {
        const partialKey = Object.keys(partialSchemaPayloadObject).pop();
        if (schemaPayloadObject[partialKey]) {
          if (check.not.array(schemaPayloadObject[partialKey])) {
            // wrap in array
            schemaPayloadObject[partialKey] = [schemaPayloadObject[partialKey]]
          }
          schemaPayloadObject[partialKey].push(partialSchemaPayloadObject[partialKey]);
          return schemaPayloadObject;
        }
        return {...schemaPayloadObject, ...partialSchemaPayloadObject}
      }, {});
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
        if (check.array(this.payload[assertionKey])) {
          const propertyValueInvalid = new Error(`property ${assertionKey} can not have multiple assertions and can therefore not be an array`)
          const invalidProperty = new VError(propertyValueInvalid, 'invalid payload input');
          throw new VError(invalidProperty, 'failed to create schema payload assertions');
        }
        const assertionValue = this.payload[assertionKey];
        if (this.client.isNegative(assertionValue)) {
          const NegativeAF = this.client.getNegativeAssertionFactoryFromSchema(
            this.client.schema[assertionKey])
          promises.push(NegativeAF.create(validOptions));
        } else {
          promises.push(AssertionEntity.create(validOptions));
        }
      }
      if (AssertionEntity.prototype instanceof this.client.Rlay_DataPropertyAssertion) {
        if (check.not.array(this.payload[assertionKey])) {
          // wrap it into an array
          this.payload[assertionKey] = [this.payload[assertionKey]]
        }
        this.payload[assertionKey].forEach(assertionValue => {
          if (this.client.isNegative(assertionValue)) {
            const NegativeAF = this.client.getNegativeAssertionFactoryFromSchema(
              this.client.schema[assertionKey])
            promises.push(
              NegativeAF.create({...validOptions, target: assertionValue.value}));
          } else {
            promises.push(
              AssertionEntity.create({...validOptions, target: assertionValue}));
          }
        });
      }
      if (AssertionEntity.prototype instanceof this.client.Rlay_ObjectPropertyAssertion) {
        if (check.not.array(this.payload[assertionKey])) {
          // wrap it into an array
          this.payload[assertionKey] = [this.payload[assertionKey]]
        }
        if (!check.all(this.payload[assertionKey].map(assertionValue => {
          return assertionValue instanceof this.client.Rlay_Individual ||
            (this.client.isNegative(assertionValue) &&
              assertionValue.value instanceof this.client.Rlay_Individual)
        }))) {
          const propertyValueInvalid = new Error(`property ${assertionKey} not an individual entity`)
          const invalidProperty = new VError(propertyValueInvalid, 'invalid property value');
          throw new VError(invalidProperty, 'failed to create individual');
        }
        await forEach(this.payload[assertionKey], async assertionEntity => {
          if (this.client.isNegative(assertionEntity)) {
            if (check.undefined(assertionEntity.value.remoteCid)) {
              await assertionEntity.value.create();
            }
            const NegativeAF = this.client.getNegativeAssertionFactoryFromSchema(
              this.client.schema[assertionKey])
            promises.push(
              NegativeAF.create({...validOptions, target: assertionEntity.value.remoteCid}));
          } else {
            if (check.undefined(assertionEntity.remoteCid)) {
              await assertionEntity.create();
            }
            promises.push(
              AssertionEntity.create({...validOptions, target: assertionEntity.remoteCid}));
          }
        });
      }
    });
    this.entities = await Promise.all(promises);
    return this.entities;
  }
}

module.exports = { SchemaPayload }
