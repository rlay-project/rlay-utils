#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esformatter = require('esformatter');

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

const generateCode = (assertions) => {
  return `const fs = require('fs');
  const path = require('path');
  const ontology = require('../../utils/ontology.js');

  const schemaSeeded = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../build/schema/seed.json'), 'utf8'));

  module.exports = {};

  ${assertions}`
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const generateClassesCode = (entities) => {
  return Object.keys(entities).map(key => {
    if (entities[key].type === 'Class') {
      return `
      module.exports.store${capitalizeFirstLetter(key)}Assertion = (subject) => {
        return ontology.storeClassAssertion({
          subject: subject || '0x00',
          class: schemaSeeded.${key},
        });
      }`
    }
  }).filter(row => row);
}

const generateDPsCode = (entities) => {
  return Object.keys(entities).map(key => {
    if (entities[key].type === 'DataProperty') {
      return `
      module.exports.store${capitalizeFirstLetter(key)}Assertion = (target, subject) => {
        return ontology.storeDataPropertyAssertion({
          subject: subject || '0x00',
          target: target,
          property: schemaSeeded.${key},
        });
      }`
    }
  }).filter(row => row);
}

const generateOPsCode = (entities) => {
  return Object.keys(entities).map(key => {
    if (entities[key].type === 'ObjectProperty') {
      return `
      module.exports.store${capitalizeFirstLetter(key)}Assertion = (subject, object) => {
        return ontology.storeObjectPropertyAssertion({
          subject: subject,
          target: object,
          property: schemaSeeded.${key},
        });
      }`
    }
  }).filter(row => row);
}

const assertions = Object.keys(schemas).map(key => {
  const assertions = [];
  if (schemas[key].classes) {
    assertions.push(generateClassesCode(schemas[key].classes()));
  }

  if (schemas[key].dataProperties) {
    assertions.push(generateDPsCode(schemas[key].dataProperties()));
  }

  if (schemas[key].objectProperties) {
    assertions.push(generateOPsCode(schemas[key].objectProperties()));
  }

  // flatten and return
  return assertions.reduce((arr, n) => [...arr, ...n], []);
}).reduce((arr, n) => [...arr, ...n], []);

const source = esformatter.format(generateCode(assertions.join('')));
fs.writeFileSync(path.join(process.cwd(), './generated/rlay-client/index.js'), source, 'utf8');
