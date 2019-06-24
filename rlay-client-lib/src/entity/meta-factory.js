const logger = require('../logger')(__filename);

class EntityMetaFactory {
  constructor (client) {
    this.client = client;
  }

  fromType (type, payload) {
    try {
      if (type === 'Annotation') {
        return new this.client.Rlay_Annotation(this.client, payload);
      }
      if (type === 'AnnotationProperty') {
        return new this.client.Rlay_AnnotationProperty(this.client, payload);
      }
      if (type === 'Class') {
        return new this.client.Rlay_Class(this.client, payload);
      }
      if (type === 'ClassAssertion') {
        return new this.client.Rlay_ClassAssertion(this.client, payload);
      }
      if (type === 'DataProperty') {
        return new this.client.Rlay_DataProperty(this.client, payload);
      }
      if (type === 'DataPropertyAssertion') {
        return new this.client.Rlay_DataPropertyAssertion(this.client, payload);
      }
      if (type === 'ObjectProperty') {
        return new this.client.Rlay_ObjectProperty(this.client, payload);
      }
      if (type === 'ObjectPropertyAssertion') {
        return new this.client.Rlay_ObjectPropertyAssertion(this.client, payload);
      }
      if (type === 'Individual') {
        return new this.client.Rlay_Individual(this.client, payload);
      }
    } catch (e) {
      const oldStarReferenceRegex = /\[.\*|,.\*|:.\*/g;
      if (oldStarReferenceRegex.test(e.message)) {
        logger.warn('DEPRECATED WARNING: Update your schema files; you are using * references, which should be replaced with the actual CID of the entity. This will throw an error in the next MINOR version. No CID can be computed for this entity');
        logger.error(`Original Error Message: ${e.message}`);
      } else {
        // rethrow
        throw e
      }
    }
    return new Error(`Can not create Entity instance from type: ${type}`);
  }

  fromSchema (entity) {
    const newClass = { };
    const newClassName = 'newClassName';

    if (entity instanceof this.client.Rlay_Class) {
      newClass[newClassName] = class extends this.client.Rlay_ClassAssertion { }
      newClass[newClassName].type = this.client.Rlay_ClassAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_ClassAssertion.fields;
      newClass[newClassName].fieldsDefault = this.client.Rlay_ClassAssertion.fieldsDefault;
      newClass[newClassName].fieldsDefault.subject = '0x00';
      newClass[newClassName].fieldsDefault.class = entity.cid;
    } else if (entity instanceof this.client.Rlay_DataProperty) {
      newClass[newClassName] = class extends this.client.Rlay_DataPropertyAssertion { }
      newClass[newClassName].type = this.client.Rlay_DataPropertyAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_DataPropertyAssertion.fields;
      newClass[newClassName].fieldsDefault = this.client.Rlay_DataPropertyAssertion.fieldsDefault;
      newClass[newClassName].fieldsDefault.subject = '0x00';
      newClass[newClassName].fieldsDefault.property = entity.cid;
    } else if (entity instanceof this.client.Rlay_ObjectProperty) {
      newClass[newClassName] = class extends this.client.Rlay_ObjectPropertyAssertion { }
      newClass[newClassName].type = this.client.Rlay_ObjectPropertyAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_ObjectPropertyAssertion.fields;
      newClass[newClassName].fieldsDefault = this.client.Rlay_ObjectPropertyAssertion.fieldsDefault;
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
