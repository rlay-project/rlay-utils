#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Web3 = require("web3");
const pQueue = require("p-queue");
const rlay = require("@rlay/web3-rlay");
const ProgressBar = require("progress");
const debug = require("debug")("rlay-seed");

const buildProgresssBar = total => {
  return new ProgressBar(`Seeding [:bar] :current/:total :etas`, {
    width: 80,
    incomplete: " ",
    total
  });
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

  const storeLimit = new pQueue({ concurrency: 1 });

  const readFile = path => {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  };

  function resolveThunk(thunk) {
    return typeof thunk === "function" ? thunk() : thunk;
  }

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

  const seedFromFile = async (contents, { imports }) => {
    const nameCidMap = {};

    const progress = buildProgresssBar(Object.keys(contents).length);

    const storeEntity = async entity => {
      debug("storeEntity", entity);
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
        return web3.rlay.experimentalGetEntityCid(entity).then(cid =>
          web3.rlay.experimentalGetEntity(cid, options).then(maybeRes => {
            if (maybeRes) {
              return cid;
            }
            return normalStore(entity);
          })
        );
      };

      const cid = await optionalStore(entity);
      return cid;
    };

    const resolveRefName = refName => {
      let refResult = nameCidMap[refName];
      if (imports) {
        refResult = refResult || imports[refName];
      }

      const presentInEntities = Object.keys(contents).includes(refName);
      if (!refResult && !presentInEntities) {
        console.error(
          `Reference "${refName}" unknown. Unable to finish seeding.`
        );
        process.exit(1);
      }

      return refResult;
    };

    Object.keys(contents).forEach(name => {
      const val = contents[name];
      if (typeof val === "string" && val.startsWith("0x")) {
        nameCidMap[name] = val;
        delete contents[name];
      }
    });

    Object.values(contents).forEach(entity => {
      Object.keys(entity).forEach(field => {
        if (isSpecialField(entity, field)) {
          transformSpecialField(entity, field);
        }
      });
    });

    // we also need to track the last promise that was run so we can wait for the last promise after the queue became empty
    let latestPromise = null;
    const addEntity = async (name, entity) => {
      if (resolveRefName(name)) {
        return resolveRefName(name);
      }

      const missingReferences = [];
      Object.keys(entity).forEach(field => {
        if (isSpecialField(entity, field)) {
          return;
        }

        const fieldVal = entity[field];
        if (Array.isArray(fieldVal)) {
          fieldVal.forEach((val, i) => {
            if (val.startsWith("*")) {
              const refName = val.replace("*", "");
              if (resolveRefName(refName)) {
                entity[field][i] = resolveRefName(refName);
              } else {
                missingReferences.push(refName);
              }
            }
          });
        } else if (fieldVal.startsWith("*")) {
          const refName = fieldVal.replace("*", "");
          if (resolveRefName(refName)) {
            entity[field] = resolveRefName(refName);
          } else {
            missingReferences.push(refName);
          }
        }
      });

      if (missingReferences.length === 0) {
        return storeEntity(entity).then(cid => {
          nameCidMap[name] = cid;
        });
      } else {
        // add all the mising entities to the queue, and then the entity itself
        missingReferences.forEach(refName => {
          storeLimit.add(() => {
            latestPromise = addEntity(refName, contents[refName]);
            return latestPromise;
          });
        });
        storeLimit.add(() => {
          latestPromise = addEntity(name, entity);
          return latestPromise;
        });
        return Promise.resolve(null);
      }
    };

    Object.keys(contents).forEach(async name => {
      const entity = contents[name];
      storeLimit.add(() => {
        latestPromise = addEntity(name, entity);
        return latestPromise;
      });
    });
    await storeLimit.onEmpty();
    await latestPromise;

    return nameCidMap;
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

  const getSeedConfigJson = seedFilePath => {
    const fileContents = readFile(seedFilePath);
    let version = fileContents.version;
    if (!version) {
      console.warn(
        "No top level version field specified. Assuming version '1'."
      );
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
        includeImportsInOutput: resolveThunk(
          configScript.includeImportsInOutput
        ),
        imports: resolveThunk(configScript.imports),
        entities: resolveThunk(configScript.entities)
      };
    }
  };

  const main = async config => {
    const seedFilePath = config.inputFilePath;
    const seedConfig = getSeedConfig(seedFilePath);
    const nameCidMap = await seedFromFile(seedConfig.entities, seedConfig);
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
