const rlay = require("@rlay/web3-rlay");
const mapValues = require("lodash.mapvalues");
const ontology = require("@rlay/ontology");

import {
  calculateEntityTreeReferences,
  isSpecialField,
  resolveEntityTreeReferences
} from "../seed/utils";

const seedFromFile = (contents, { imports }) => {
  const transformSpecialField = (entity, field) => {
    if (field === "type") {
      return;
    }
    if (field === "value" && entity.type === "Annotation") {
      entity.value = rlay.encodeValue(entity.value);
      return;
    }
    if (
      field === "target" &&
      (entity.type === "DataPropertyAssertion" ||
        entity.type === "NegativeDataPropertyAssertion")
    ) {
      entity.target = rlay.encodeValue(entity.target);
      return;
    }
  };

  const transformEntitySpecialFields = entity => {
    const newEntity = Object.assign({}, entity);

    Object.keys(newEntity).forEach(field => {
      if (isSpecialField(newEntity, field)) {
        transformSpecialField(newEntity, field);
      }
    });

    return newEntity;
  };

  // Prepare entities for seeding
  const transformedContents = mapValues(contents, transformEntitySpecialFields);
  const allNamedEntitiesResolved = calculateEntityTreeReferences(
    Object.assign({}, imports, transformedContents));

  const nameCidMap = {};
  Object.keys(allNamedEntitiesResolved).forEach(key => {
    const entity = allNamedEntitiesResolved[key];
    if (typeof entity === "string" && entity.startsWith("0x")) {
      nameCidMap[key] = entity;
      return;
    }

    const cid = ontology.getEntityCid(entity);
    nameCidMap[key] = cid;
  });

  return resolveEntityTreeReferences(transformedContents, nameCidMap);
};

export { seedFromFile };
