#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
//import esformatter from 'esformatter';
import Generator from './generator.js';

// `require()` all schema files
// It assumes right now that,
// (1) all schema files are in project root /schema
// For the lower part of this generate command to work, it also assumes that
// (2) all files in /schema are proper .js files
// (3) all .js files export
//     { classes: [Function], dataProperties: [Function], objectProperties: [Function] }
// TODO: check that name does not contain symbols that are prohibited in JS func names e.g. `/`, etc.
const schemas = {};
const schemaPath = path.join(process.cwd(), 'schema');
fs.readdirSync(schemaPath).forEach(function(file) {
  // schemas[file-name.js -> file-name]
  schemas[file.split('.').shift()] = require(path.join(schemaPath, file));
});

const assertions = [];
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

Object.keys(schemas).forEach(fileKey => {
  Object.keys(schemas[fileKey]).forEach(assertionType => {
    addAssertions(fileKey, schemas[fileKey][assertionType]());
  });
});

const source = Generator.generate(JSON.stringify(assertions));

const generatedDir = path.join(process.cwd(), './generated/rlay-client/');
const generatedFile = path.join(generatedDir, './index.js');
fs.ensureDirSync(generatedDir);
fs.writeFileSync(generatedFile, source, 'utf8');
