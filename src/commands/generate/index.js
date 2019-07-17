#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
//import esformatter from 'esformatter';
import Generator from './generator.js';
import { seedFromFile } from './seedFileUtils.js';

const isNonAssertiveSchemaEntity = (entityObject) => {
  const green = ['Class', 'DataProperty', 'ObjectProperty'];
  return green.includes(entityObject.type);
}

const getFilePath = (pathString) => {
  let seedFilePath = path.join(process.cwd(), pathString);
  if (path.isAbsolute(pathString)) {
    seedFilePath = pathString;
  }
  return seedFilePath;
}

const getFileRequired = (path) => {
  if (!fs.existsSync(seedFilePath)) throw new Error(`${seedFilePath} does not exist`);
  return require(path);
}

const program = require("yargs")
  .env()
  .option("seed-file-output", {
    describe: "path to the file that contains the output of the rlay-seed command"
  })
  .option("seed-file", {
    describe: "path to the file that served as input for the rlay-seed command"
  })
  .option("output", {
    describe: "path to the file where the generated rlay client should be written to"
  })
  .default("seed-file-output", "./generated/seed.json")
  .default("seed-file", "./seed.js")
  .default("output", "./generated/rlay-client/index.js")
  .argv;

// get the actual files for the options or print errors
//   seed-file
const seedFilePath = getFilePath(program.seedFile);
const seedFile = getFileRequired(seedFilePath);
if (!seedFile.entities) {
  throw new Error(`{seedFilePath} is not a valid Rlay seed file. Root object must have '.entities' property.`);
}
//   seed-file-output
const seedFileOutputPath = getFilePath(program.seedFileOutput);
const seededSchema = getFileRequired(seedFileOutputPath);

const seedFileEntities = seedFromFile(seedFile.entities, seedFile);

const entities = Object.keys(seedFileEntities).
  map(entityKey => ({ key: entityKey, assertion: seedFile.entities[entityKey] })).
  filter(e => isNonAssertiveSchemaEntity(e.assertion));

const source = Generator.generate(
  JSON.stringify(seededSchema),
  JSON.stringify(entities)
);

const clientPathSplit = program.output.split('/');
const clientPathFile = './' + clientPathSplit.pop();
const clientPathDir = clientPathSplit.join('/') + '/';

const generatedDir = getFilePath(clientPathDir);
const generatedFile = path.join(generatedDir, clientPathFile);
fs.ensureDirSync(generatedDir);
fs.writeFileSync(generatedFile, source, 'utf8');
