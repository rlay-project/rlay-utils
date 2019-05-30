#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
//import esformatter from 'esformatter';
import Generator from './generator.js';

const program = require("yargs")
  .env()
  .option("seeded-schema", {
    describe: "relative path to file that contains the seeded schema cids"
  })
  .option("schema-dir", {
    describe: "relative path to folder that contains the schema .js files"
  })
  .option("client-path", {
    describe: "relative path to file that exports generated rlay client"
  })
  .default("seeded-schema", "./build/schema/seed.json")
  .default("schema-dir", "./schema")
  .default("client-path", "./generated/rlay-client/index.js")
  .argv;

// init required variables
const schemas = {};
const assertions = [];
const schemaPath = path.join(process.cwd(), program.schemaDir);
const seededSchemaFilePath = path.join(process.cwd(), program.seededSchema);
const seededSchema = require(seededSchemaFilePath);

// init required functions
const addAssertions = (fileKey, _assertions) => {
  const green = ['Class', 'DataProperty', 'ObjectProperty'];
  Object.keys(_assertions).forEach(assertionKey => {
    if (green.includes(_assertions[assertionKey].type)) {
      assertions.push({
        file: fileKey,
        key: assertionKey,
        assertion: _assertions[assertionKey]
      });
    }
  })
}

// `require()` all schema files
// For the lower part of this generate command to work, it assumes that
// (1) all files in /schema are proper .js files
// (2) all .js files export
//     { classes: [Function], dataProperties: [Function], objectProperties: [Function] }
// TODO: check that name does not contain symbols that are prohibited in JS func names e.g. `/`, etc.
if (!fs.existsSync(schemaPath)) throw new Error(`${schemaPath} does not exist`);
fs.readdirSync(schemaPath).forEach(function(file) {
  // schemas[file-name.js -> file-name]
  schemas[file.split('.').shift()] = require(path.join(schemaPath, file));
});

Object.keys(schemas).forEach(fileKey => {
  Object.keys(schemas[fileKey]).forEach(assertionType => {
    addAssertions(fileKey, schemas[fileKey][assertionType]());
  });
});

const source = Generator.generate(
  JSON.stringify(seededSchema),
  JSON.stringify(assertions)
);

const clientPathSplit = program.clientPath.split('/');
const clientPathFile = './' + clientPathSplit.pop();
const clientPathDir = clientPathSplit.join('/') + '/';

const generatedDir = path.join(process.cwd(), clientPathDir);
const generatedFile = path.join(generatedDir, clientPathFile);
fs.ensureDirSync(generatedDir);
fs.writeFileSync(generatedFile, source, 'utf8');
