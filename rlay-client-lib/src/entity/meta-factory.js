const Entity = require('./entity');

class EntityMetaFactory {
  constructor (client) {
    this.client = client;
  }

  fromType (type, payload, cid) {
    if (type === 'Annotation') {
      return new this.client.Rlay_Annotation(this.client, payload, cid);
    }
    if (type === 'Class') {
      return new this.client.Rlay_Class(this.client, payload, cid);
    }
    if (type === 'DataProperty') {
      return new this.client.Rlay_Class(this.client, payload, cid);
    }
    if (type === 'ObjectProperty') {
      return new this.client.Rlay_Class(this.client, payload, cid);
    }
    return new Error(`Can not create Entity instance from type: ${type}`);
  }

  createNewEntity (newClassName, type) {
    const newClass = { };
    newClass[newClassName] = class extends Entity { }
    newClass[newClassName].setClient(this.client);
    newClass[newClassName].setType(type);
    return newClass[newClassName];
  }

  createNewEntityClassFromEntityClass (entityClass) {
    const newClass = { };
    const newClassName = 'newClassName';
    newClass[newClassName] = class extends entityClass { }
    newClass[newClassName].setClient(this.client);
    newClass[newClassName].setType(entityClass.type);
    return newClass[newClassName];
  }

  fromSchema (entity) {
    const newClass = { };
    const newClassName = 'newClassName';

    if (entity instanceof this.client.Rlay_Class) {
      newClass[newClassName] = class extends this.client.Rlay_ClassAssertion { }
      newClass[newClassName].type = this.client.Rlay_ClassAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_ClassAssertion.fields;
      newClass[newClassName].fieldsDefault = { subject: '0x00', class: entity.cid };
    } else if (entity instanceof this.client.Rlay_DataProperty) {
      newClass[newClassName] = class extends this.client.Rlay_DataPropertyAssertion { }
      newClass[newClassName].type = this.client.Rlay_DataPropertyAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_DataPropertyAssertion.fields;
      newClass[newClassName].fieldsDefault = { subject: '0x00', property: entity.cid };
    } else if (entity instanceof this.client.Rlay_ObjectProperty) {
      newClass[newClassName] = class extends this.client.Rlay_ObjectPropertyAssertion { }
      newClass[newClassName].type = this.client.Rlay_ObjectPropertyAssertion.type;
      newClass[newClassName].fields = this.client.Rlay_ObjectPropertyAssertion.fields;
      newClass[newClassName].fieldsDefault = { subject: '0x00', property: entity.cid };
    } else {
      return new Error(`Can not create Entity Class from entity with type: ${entity.type}`);
    }

    newClass[newClassName].client = this.client;
    return newClass[newClassName];

  }
}

module.exports = EntityMetaFactory;
