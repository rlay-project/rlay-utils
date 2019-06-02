const ontology = require("@rlay/ontology");

/**
 * Takes a map where the keys are entity reference names, and the values are entities.
 * The entities can have references to other entities in the form of`*<REFERENCE_NAME>` in place
 * of CIDs.
 *
 * Outputs a map with the same keys, where all the references have been replaced with calculated CIDs.
 */
const calculateEntityTreeReferences = entityTree => {
  const isSpecialField = (entity, field) => {
    if (field === "type") {
      return true;
    }
    if (field === "value" && entity.type === "Annotation") {
      return true;
    }
    if (
      field === "target" &&
      (entity.type === "DataPropertyAssertion" ||
        entity.type === "NegativeDataPropertyAssertion")
    ) {
      return true;
    }
    return false;
  };

  const cidMap = {};
  const derefTree = {};

  const entityContainsReferences = entity => {
    let containsReferences = false;

    Object.keys(entity).forEach(field => {
      if (isSpecialField(entity, field)) {
        return;
      }

      const fieldVal = entity[field];
      if (Array.isArray(fieldVal)) {
        fieldVal.forEach((val, i) => {
          if (val.startsWith("*")) {
            containsReferences = true;
          }
        });
      } else if (fieldVal.startsWith("*")) {
        containsReferences = true;
      }
    });

    return containsReferences;
  };

  const calculateEntityCid = (entityTree, refName) => {
    let normalizedRefName = refName;
    if (normalizedRefName.startsWith("*")) {
      normalizedRefName = val.replace("*", "");
    }

    if (cidMap[normalizedRefName]) {
      return cidMap[normalizedRefName];
    }

    const entity = entityTree[normalizedRefName];
    if (!entityContainsReferences(entity)) {
      const cid = ontology.getEntityCid(entity);
      cidMap[normalizedRefName] = cid;
      return cid;
    }

    const derefEntity = replaceReferencesWithCids(entityTree, entity);
    const cid = ontology.getEntityCid(derefEntity);
    cidMap[normalizedRefName] = cid;
    return cid;
  };

  const replaceReferencesWithCids = (entityTree, entity) => {
    const newEntity = Object.assign({}, entity);

    Object.keys(newEntity).forEach(field => {
      if (isSpecialField(newEntity, field)) {
        return;
      }

      const fieldVal = newEntity[field];
      if (Array.isArray(fieldVal)) {
        fieldVal.forEach((val, i) => {
          const refName = val.replace("*", "");
          if (val.startsWith("*")) {
            newEntity[field][i] = calculateEntityCid(entityTree, refName);
          }
        });
      } else if (fieldVal.startsWith("*")) {
        const refName = fieldVal.replace("*", "");
        newEntity[field] = calculateEntityCid(entityTree, refName);
      }
    });

    return newEntity;
  };

  Object.keys(entityTree).forEach(key => {
    const value = entityTree[key];
    if (!entityContainsReferences(value)) {
      derefTree[key] = value;
      return;
    }

    derefTree[key] = replaceReferencesWithCids(entityTree, value);
  });

  return derefTree;
};

module.exports = {
  calculateEntityTreeReferences
};
