const Entity = require('./entity');
const check = require('check-types');
const VError = require('verror');

class EntityMetaFactory {
  constructor (client) {
    this.client = client;
  }

  getEntityFactoryFromPayload (payload) {
    if (check.not.string(payload.type)) {
      const typeMissing = new Error('payload has not type specified');
      throw new VError(typeMissing, 'failed to get entity factory');
    }
    const EntityTypeClass = this.client[`Rlay_${payload.type}`];
    if (check.undefined(EntityTypeClass)) {
      const typeNotPresent = new Error(`payload type ${payload.type} not present`);
      throw new VError(typeNotPresent, 'failed to get entity factory');
    }
    return EntityTypeClass;
  }

  getEntityFromPayload (payload) {
    const EntityTypeClass = this.getEntityFactoryFromPayload(payload);
    return new EntityTypeClass(this.client, payload);
  }

  fromType (type, payload) {
    console.warn('DEPRECATED: use `.getEntityFromPayload`. `.fromType` will be retired in the next minor release');
    const EntityTypeClass = this.client[`Rlay_${type}`];
    if (!EntityTypeClass) throw new Error(`no entity found for ${type}`);
    if (!(EntityTypeClass.prototype instanceof Entity)) {
      throw new Error(`expected entity for ${type} to inherit from Entity`);
    }
    return new EntityTypeClass(this.client, payload);
  }

  fromSchema (entity) {
    const newClass = { };
    const newClassName = 'newClassName';

    if (entity instanceof this.client.Rlay_Class) {
      newClass[newClassName] = class extends this.client.Rlay_ClassAssertion { }
      newClass[newClassName].type = this.client.Rlay_ClassAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_ClassAssertion.fields;
      newClass[newClassName].fieldsDefault = JSON.parse(JSON.stringify(
        this.client.Rlay_ClassAssertion.fieldsDefault));
      newClass[newClassName].fieldsDefault.subject = '0x00';
      newClass[newClassName].fieldsDefault.class = entity.cid;
    } else if (entity instanceof this.client.Rlay_DataProperty) {
      newClass[newClassName] = class extends this.client.Rlay_DataPropertyAssertion { }
      newClass[newClassName].type = this.client.Rlay_DataPropertyAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_DataPropertyAssertion.fields;
      newClass[newClassName].fieldsDefault = JSON.parse(JSON.stringify(
        this.client.Rlay_DataPropertyAssertion.fieldsDefault));
      newClass[newClassName].fieldsDefault.subject = '0x00';
      newClass[newClassName].fieldsDefault.property = entity.cid;
    } else if (entity instanceof this.client.Rlay_ObjectProperty) {
      newClass[newClassName] = class extends this.client.Rlay_ObjectPropertyAssertion { }
      newClass[newClassName].type = this.client.Rlay_ObjectPropertyAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_ObjectPropertyAssertion.fields;
      newClass[newClassName].fieldsDefault = JSON.parse(JSON.stringify(
        this.client.Rlay_ObjectPropertyAssertion.fieldsDefault));
      newClass[newClassName].fieldsDefault.subject = '0x00';
      newClass[newClassName].fieldsDefault.property = entity.cid;
    } else {
      return undefined
      //return new Error(`Can not create Entity Class from entity with type: ${entity.type}`);
    }

    newClass[newClassName].client = this.client;
    return newClass[newClassName];
  }
}

module.exports = EntityMetaFactory;
