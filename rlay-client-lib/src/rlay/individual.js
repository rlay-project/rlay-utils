const Entity = require('../entity/entity');

const schemaTypeMapping = {
  'ClassAssertion': 'class_assertions',
  'DataPropertyAssertion': 'data_property_assertions',
  'ObjectPropertyAssertion': 'object_property_assertions',
};

class Rlay_Individual extends Entity {
  static prepareRlayFormat (params) {
    return Object.assign(params, { type: this.type })
  }

  static async create (properties = {}) {
    const propertyKeys = Object.keys(properties);
    const propertyEntityPromises = [];
    const entityValue = {};

    propertyKeys.forEach(propertyName => {
      if (this.client[propertyName]) {
        propertyEntityPromises.push(this.client[propertyName].create());
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
}

Rlay_Individual.type = 'Individual';
Rlay_Individual.fields = [];

module.exports = Rlay_Individual;
