#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Web3 = require("web3");
const pLimit = require("p-limit");
const rlay = require("@rlay/web3-rlay");
const ProgressBar = require("progress");
const groupBy = require("lodash.groupby");
const mapValues = require("lodash.mapvalues");
const ontology = require("@rlay/ontology");
const debug = require("debug")("rlay-seed");

const {
  calculateEntityTreeReferences,
  isSpecialField,
  resolveEntityTreeReferences,
  resolveThunk,
  calculateDependencyCount
} = require("./seed/utils");
/**
 * Get seed config from a ".json" file.
 */
const getSeedConfigJson = seedFilePath => {
  const readFile = path => {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  };

  const fileContents = readFile(seedFilePath);
  let version = fileContents.version;
  if (!version) {
    console.warn("No top level version field specified. Assuming version '1'.");
    version = "1";
  }
  if (version === "1") {
    return { entities: fileContents };
  }
  if (version === "2") {
    return {
      includeImportsInOutput: fileContents.includeImportsInOutput,
      entities: fileContents.entities,
      imports: fileContents.imports
    };
  }
  console.error("Unknown seed file format version.");
  process.exit(1);
};

/**
 * Get seed config from a ".js" file.
 */
const getSeedConfigJs = seedFilePath => {
  const configScript = require(seedFilePath);
  const version = resolveThunk(configScript.version);
  if (version !== "2") {
    console.error("Unsupported seed file format version.");
    process.exit(1);
    return;
  }
  if (version === "2") {
    return {
      includeImportsInOutput: resolveThunk(configScript.includeImportsInOutput),
      imports: resolveThunk(configScript.imports),
      entities: resolveThunk(configScript.entities)
    };
  }
};

const getSeedConfig = seedFilePath => {
  if (seedFilePath.endsWith(".json")) {
    return getSeedConfigJson(seedFilePath);
  }
  if (seedFilePath.endsWith(".js")) {
    return getSeedConfigJs(seedFilePath);
  }
  console.error("Seed file format not recognizable by file extension.");
  process.exit(1);
};

const buildProgresssBar = total => {
  return new ProgressBar(`Seeding [:bar] :current/:total :etas`, {
    width: 80,
    incomplete: " ",
    total
  });
};

const storeEntity = async (entity, web3, config, progress) => {
  const normalStore = entity => {
    const options = {
      gas: 1000000
    };
    if (config.backend) {
      options.backend = config.backend;
    }
    return rlay.store(web3, entity, options).then(cid => {
      progress.tick();
      return cid;
    });
  };

  const optionalStore = entity => {
    const options = {};
    if (config.backend) {
      options.backend = config.backend;
    }

    const cid = ontology.getEntityCid(entity);
    return web3.rlay.experimentalGetEntity(cid, options).then(maybeRes => {
      if (maybeRes) {
        progress.tick();
        return cid;
      }
      return normalStore(entity);
    });
  };

  const cid = await optionalStore(entity);
  return cid;
};

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

const mainWithConfig = async cfg => {
  let config = cfg;
  if (!cfg) {
    const program = require("yargs")
      .env()
      .option("from-address", {
        describe: "Send the transactions from [address]"
      })
      .option("backend", {
        describe: "The name of the Rlay backend to use on the RPC"
      })
      .option("rpc-url", {
        describe: "URL of JSON-RPC endpoint [url]"
      })
      .default("rpc-url", "http://localhost:8546")
      .option("input", {
        demandOption: true
      }).argv;

    config = {
      address: program.fromAddress,
      backend: program.backend,
      rpcUrl: program.rpcUrl,
      inputFilePath: path.resolve(program.input)
    };
  }

  const web3 = new Web3(config.rpcUrl);
  rlay.extendWeb3WithRlay(web3);
  web3.eth.defaultAccount = config.address;

  const seedFromFile = async (contents, { imports }, config) => {
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
    const transformedContents = mapValues(
      contents,
      transformEntitySpecialFields
    );
    const allNamedEntities = Object.assign({}, imports, transformedContents);
    const allNamedEntitiesResolved = calculateEntityTreeReferences(
      allNamedEntities
    );

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

    const entitiesToSeed = resolveEntityTreeReferences(
      transformedContents,
      nameCidMap
    );

    // merge reference name into entity object
    const entitiesForDepCount = Object.keys(entitiesToSeed).map(key => {
      const entity = entitiesToSeed[key];
      return Object.assign({}, entity, { refName: key });
    });
    const entitiesWithDepCount = calculateDependencyCount(entitiesForDepCount);
    const entitiesByDepCount = groupBy(entitiesWithDepCount, "depCount");

    // Start seeding
    const storeLimit = pLimit(10);
    const storeGroupLimit = pLimit(1);
    const progress = buildProgresssBar(
      Object.keys(entitiesWithDepCount).length
    );

    const seededNameCidMap = {};
    await Promise.all(
      Object.values(entitiesByDepCount).map(seedGroup =>
        // store one group of same dependency count after the other
        storeGroupLimit(() =>
          Promise.all(
            seedGroup.map(entityWithInfo =>
              storeLimit(() =>
                storeEntity(entityWithInfo.entity, web3, config, progress).then(
                  cid => {
                    seededNameCidMap[entityWithInfo.refName] = cid;
                  }
                )
              )
            )
          )
        )
      )
    );

    return seededNameCidMap;
  };

  const main = async config => {
    const seedFilePath = config.inputFilePath;
    const seedConfig = getSeedConfig(seedFilePath);
    const nameCidMap = await seedFromFile(seedConfig.entities, seedConfig, {
      backend: config.backend
    });
    if (seedConfig.includeImportsInOutput) {
      Object.keys(seedConfig.imports).forEach(ref => {
        nameCidMap[ref] = seedConfig.imports[ref];
      });
    }

    return nameCidMap;
  };
  return main(config);
};

if (require.main === module) {
  // file used as executable; running main function
  mainWithConfig().then(nameCidMap => {
    console.log(JSON.stringify(nameCidMap, null, 4));
  });
}

module.exports = {
  mainWithConfig
};
