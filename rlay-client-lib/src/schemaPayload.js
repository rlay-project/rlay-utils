const { ClientInterface } = require('./interfaces/client');
const { Payload } = require('./payload');
const check = require('check-types');
const { forEach } = require('p-iteration');
const err = require('./errors').SchemaPayload;
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
  if (searchResult === null) {
    throw new Error('no schema found for cid: ' + cid);
  }
  return searchResult;
}

class SchemaPayload {
  constructor (client, payloadObject, options = {}) {
    if (check.not.instance(client, ClientInterface)) throw err.invalidClient();

    // validate payloadObject
    Object.keys(payloadObject).forEach(key => {
      if (!client[key]) throw err.schemaEntityNotFound(key);
    });

    const normalizedPayloadObject = SchemaPayload.
      normalizePayloadObject(payloadObject);
    this.schemaAssertions = normalizedPayloadObject.map(object => {
      const key = object.key;
      const value = object.value;
      const AE = client[key];
      const validOptions = filterByValidKeys(options, ['subject']);
      if (AE.prototype instanceof client.Rlay_ClassAssertion) {
        if (client.isNegative(value)) {
          const NegativeAF = client.getNegativeAssertionFactoryFromSchema(
            client.schema[key]);
          return NegativeAF.from({...validOptions});
        }
        return AE.from({...validOptions});
      }
      if (AE.prototype instanceof client.Rlay_DataPropertyAssertion) {
        if (client.isNegative(value)) {
          const NegativeAF = client.getNegativeAssertionFactoryFromSchema(
            client.schema[key]);
          return NegativeAF.from({...validOptions, target: value.value});
        }
        return AE.from({...validOptions, target: value});
      }
      if (AE.prototype instanceof client.Rlay_ObjectPropertyAssertion) {
        if (client.isNegative(value)) {
          if (!(value.value instanceof client.Rlay_Individual)) {
            const propertyValueInvalid = new Error(`property ${key} not an individual entity`)
            const invalidProperty = new VError(propertyValueInvalid, 'invalid property value');
            throw new VError(invalidProperty, 'failed to create individual');
          }
          const NegativeAF = client.getNegativeAssertionFactoryFromSchema(
            client.schema[key])
          return NegativeAF.from({...validOptions, target: value.value.cid});
        }
        if (!(value instanceof client.Rlay_Individual)) {
          const propertyValueInvalid = new Error(`property ${key} not an individual entity`)
          const invalidProperty = new VError(propertyValueInvalid, 'invalid property value');
          throw new VError(invalidProperty, 'failed to create individual');
        }
        return AE.from({...validOptions, target: value.cid});
      }
    });

    this.client = client;
    this.payload = payloadObject;
  }

  static fromPayloads (client, payloads) {
    if (check.not.instance(client, ClientInterface)) throw err.invalidClient();
    if (check.not.array(payloads) || !check.all(payloads.map(check.object))) {
      const wrongType = new Error(`expected payloads to be an array of entity payloads objects`)
      const invalidClient = new VError(wrongType, 'invalid payloads input');
      throw new VError(invalidClient, 'failed to instantiate schema payload from entity payloads');
    }
    const schemaPayloadObject = payloads.map(payload => {
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
    if (check.not.array(this.schemaAssertions)) {
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
    this.schemaAssertions.forEach(entity => {
      const propertyType = schemaTypeMapping[entity.type];
      if (propertyType) {
        newIndividualPayload[propertyType].push(entity.cid);
      }
    });
    return newIndividualPayload.toJson();
  }

  /*
   * payload Object is something like this:
   * { key: value, key2: [value, value2] }
   * which makes it difficult to process. `normalizePayloadObject` turns it into
   * [{key: key, value: value}, {key: key2, value: value}, {key: key2: value: value2}]
   */
  static normalizePayloadObject (object) {
    return Array.from(Object.keys(object), (k) => {
      if (check.array(object[k])) return object[k].map(v => ({key: k, value: v}))
      return {key: k, value: object[k]}
    }).reduce((all, one) => {
      if (check.array(one)) return [...all, ...one]
      return [...all, one]
    }, []);
  }

  async create (options = {}) {
    // create invidividuals for ObjectPropertyAssertions if they don't exist remotely yet
    const normalizedPayloadObject = SchemaPayload.
      normalizePayloadObject(this.payload);
    await forEach(normalizedPayloadObject, async object => {
      const key = object.key;
      const value = object.value;
      const AE = this.client[key];
      if (AE.prototype instanceof this.client.Rlay_ObjectPropertyAssertion) {
        if (this.client.isNegative(value)) {
          if (check.undefined(value.value.remoteCid)) {
            await value.value.create();
          }
        } else {
          if (check.undefined(value.remoteCid)) await value.create();
        }
      }
    });
    // set the options that were provided, i.e. subject and create the entities
    await Promise.all(this.schemaAssertions.map(assertion => {
      assertion.payload.subject = options.subject || assertion.payload.subject;
      return assertion.create(options);
    }));
    return this.schemaAssertions
  }
}

module.exports = { SchemaPayload }
