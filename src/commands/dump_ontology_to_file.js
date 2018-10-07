#!/usr/bin/env node

const LRU = require("lru-cache");
const Web3 = require("web3");
const fs = require("fs");

const rlay = require("@rlay/web3-rlay");
const builtins = rlay.builtins;

const web3 = new Web3(process.env.RPC_URL || "http://localhost:8546");
rlay.extendWeb3WithRlay(web3);

const entityCache = new LRU({ max: 1000 });

const retrieve = async cid => {
  let entity = entityCache.get(cid);
  if (!entity) {
    entity = await rlay.retrieve(web3, cid);
    entityCache.set(cid, entity);
  }

  return entity;
};

const getAllEntities = async () => {
  const allCids = await web3.rlay.experimentalListCids();

  const allEntities = await Promise.all(
    allCids.map(async cid => {
      const entity = await retrieve(cid);
      return {
        cid,
        ...entity
      };
    })
  );

  return allEntities;
};

const buildOutput = async builtins => {
  const builtinsReverseMap = {};
  const output = {};
  Object.keys(builtins).forEach(key => {
    const value = builtins[key];
    output[key] = value;
    builtinsReverseMap[value] = key;
  });

  const allEntities = await getAllEntities();
  const entityMap = {};
  allEntities.forEach(entity => {
    entityMap[entity.cid] = entity;
  });

  allEntities.forEach(entity => {
    if (builtinsReverseMap[entity.cid]) {
      return;
    }

    const refEntity = {};
    Object.keys(entity).forEach(entityKey => {
      let oldValue = entity[entityKey];
      let value;

      const transformToReference = val => {
        if (builtinsReverseMap[val]) {
          return `*${builtinsReverseMap[val]}`;
        } else if (entityMap[val]) {
          return `*${val}`;
        } else {
          return val;
        }
      };

      if (entityKey === "cid") {
        return;
      }
      if (
        (entity.type === "Annotation" && entityKey === "value") ||
        (entity.type === "DataPropertyAssertion" && entityKey === "target")
      ) {
        value = rlay.decodeValue(oldValue);
      } else {
        if (Array.isArray(oldValue)) {
          value = [];
          oldValue.forEach(arrayVal => {
            value.push(transformToReference(arrayVal));
          });
        } else {
          value = transformToReference(oldValue);
        }
      }

      if (!value) {
        value = oldValue;
      }
      refEntity[entityKey] = value;
    });

    output[entity.cid] = refEntity;
  });

  return output;
};

const main = async () => {
  const builtinsFilePath = process.argv[2];
  const outputFilePath = process.argv[3];

  const builtins = JSON.parse(fs.readFileSync(builtinsFilePath, "utf8"));

  const output = await buildOutput(builtins);
  fs.writeFileSync(outputFilePath, JSON.stringify(output));
};

main();
