const Entity = require('../entity/entity');
const intermediate = require('./intermediate');
const Rlay_Individual = require('./individual');

const getDefaults = (fields, defaults = {}) => {
  fields.forEach(field => {
    let defaultValue;
    if (field.kind.slice(-2) === '[]') defaultValue = [];
    if (field.name === 'subject') defaultValue = '0x00';
    defaults[field.name] = defaultValue;
  });
  return defaults;
}

const classes = { Entity };

intermediate.kinds.forEach(entity => {
  const className = `Rlay_${entity.name}`

  if (entity.name.includes('Annotation')) {
    classes[className] = class extends Entity{
      static prepareRlayFormat (params = {}) {
        params.value = this.client.rlay.encodeValue(params.value);
        return super.prepareRlayFormat(params);
      }
    }
  } else if (entity.name.includes('DataProperty')) {
    classes[className] = class extends Entity{
      static prepareRlayFormat (params = {}) {
        params.target = this.client.rlay.encodeValue(params.target);
        return super.prepareRlayFormat(params);
      }
    }
  } else if (entity.name === 'Individual') {
    classes[className] = Rlay_Individual;
  } else {
    classes[className] = class extends Entity{ }
  }
  classes[className].type = entity.name;
  classes[className].fields = entity.fields.map(field => field.name);
  classes[className].fieldsDefault = getDefaults(entity.fields);
  classes[className].intermediate = entity;
});


module.exports = classes;
