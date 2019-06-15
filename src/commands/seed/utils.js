const ontology = require("@rlay/ontology");
const debug = require("debug")("rlay-seed:utils");

const resolveThunk = thunk => {
  return typeof thunk === "function" ? thunk() : thunk;
};

/**
 * Check wether a entity field is a "special" field.
 * "Special" means all fields where the value is not assumed to be a CID.
 */
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

/**
 * Takes a map where the keys are entity reference names, and the values are either entities or CIDs.
 * The entities can have references to other entities in the form of`*<REFERENCE_NAME>` in place
 * of CIDs.
 *
 * Outputs a map with the same keys, where all the references have been replaced with calculated CIDs.
 */
const calculateEntityTreeReferences = entityTree => {
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
    if (!entity) {
      throw new ReferenceNameNotFoundError(
        `Reference *${normalizedRefName} was not found.`
      );
    }

    // value is already a CID
    if (typeof entity === "string" && entity.startsWith("0x")) {
      return entity;
    }

    if (!entityContainsReferences(entity)) {
      const cid = ontology.getEntityCid(entity);
      cidMap[normalizedRefName] = cid;
      return cid;
    }

    const derefEntity = replaceReferencesWithCids(entityTree, entity);
    debug("calculateEntityCid -> getEntityCid", derefEntity);
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

/**
 * Resolves all the references in an entity to their CIDs.
 *
 * @param {object} entity The entity with references.
 * @param {object} nameCidMap name:cid mapping.
 *
 * @returns {object} The entity with CIDs.
 */
const resolveEntityReferences = (entity, nameCidMap) => {
  const newEntity = Object.assign({}, entity);

  Object.keys(newEntity).forEach(field => {
    if (isSpecialField(newEntity, field)) {
      return;
    }

    const fieldVal = newEntity[field];
    if (Array.isArray(fieldVal)) {
      fieldVal.forEach((val, i) => {
        if (val.startsWith("*")) {
          newEntity[field][i] = nameCidMap[val.substring(1)];
        }
      });
    } else {
      if (fieldVal.startsWith("*")) {
        newEntity[field] = nameCidMap[fieldVal.substring(1)];
      }
    }
  });

  return newEntity;
};

/**
 * Resolve all references in an entity tree (name:entity map) to their CIDs.
 */
const resolveEntityTreeReferences = (entityTree, nameCidMap) => {
  const resolvedEntityTree = {};

  Object.keys(entityTree).forEach(key => {
    const entity = entityTree[key];
    const resolvedEntity = resolveEntityReferences(entity, nameCidMap);
    resolvedEntityTree[key] = resolvedEntity;
  });

  return resolvedEntityTree;
};

/**
 * Takes an array of entities, and returns an array of entities
 * sorted by their number of transitive dependencies (least dependencies first).
 */
const sortByDependencyCount = entitiesIn => {
  const entitiesWithCount = calculateDependencyCount(entitiesIn);
  entitiesWithCount.sort((a, b) => a.depCount - b.depCount);

  const entities = entitiesWithCount.map(n => n.entity);
  return entities;
};

const calculateDependencyCount = entitiesIn => {
  const countMap = {};
  const cidEntityMap = {};

  const lookupCidDepCount = cid => {
    let count = countMap[cid];
    if (count) {
      return count;
    }

    const entity = cidEntityMap[cid];
    if (!entity) {
      return 1;
    }

    count = countDependencies(entity);
    return count;
  };

  const countDependencies = entity => {
    let count = 1;

    Object.keys(entity).forEach(field => {
      if (isSpecialField(entity, field)) {
        return;
      }

      const fieldVal = entity[field];
      if (Array.isArray(fieldVal)) {
        fieldVal.forEach(val => {
          count += lookupCidDepCount(val);
        });
      } else {
        count += lookupCidDepCount(fieldVal);
      }
    });

    return count;
  };

  const cleanEntity = entity => {
    const cleanEntity = Object.assign({}, entity);
    delete cleanEntity.refName;

    debug("cleanEntity", cleanEntity);
    return cleanEntity;
  };

  entitiesIn.forEach(entity => {
    const cid = ontology.getEntityCid(cleanEntity(entity));
    cidEntityMap[cid] = entity;
  });

  const entitiesWithCount = entitiesIn.map(entity => ({
    entity: cleanEntity(entity),
    refName: entity.refName,
    depCount: countDependencies(entity)
  }));

  return entitiesWithCount;
};

class ReferenceNameNotFoundError extends Error {}

module.exports = {
  ReferenceNameNotFoundError,
  calculateEntityTreeReferences,
  isSpecialField,
  resolveEntityReferences,
  resolveEntityTreeReferences,
  resolveThunk,
  sortByDependencyCount,
  calculateDependencyCount
};
