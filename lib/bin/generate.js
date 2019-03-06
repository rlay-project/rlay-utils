#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var classCallCheck = _classCallCheck;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var createClass = _createClass;

var Generator =
/*#__PURE__*/
function () {
  function Generator() {
    classCallCheck(this, Generator);
  }

  createClass(Generator, null, [{
    key: "generate",
    value: function generate(assertions) {
      return "\n    const fs = require('fs');\n    const path = require('path');\n    const { Client } = require('rlay-client-lib');\n    const schemaSeeded = JSON.parse(\n      fs.readFileSync(path.join(__dirname, '../../build/schema/seed.json'), 'utf8'));\n\n    const client = new Client();\n    const assertions = ".concat(assertions, ";\n    assertions.forEach(assertion => {\n      client.initSchema(assertion.key, assertion.assertion);\n    });\n\n    module.exports = client;");
    }
  }]);

  return Generator;
}();

// It assumes right now that,
// (1) all schema files are in project root /schema
// For the lower part of this generate command to work, it also assumes that
// (2) all files in /schema are proper .js files
// (3) all .js files export
//     { classes: [Function], dataProperties: [Function], objectProperties: [Function] }
// TODO: check that name does not contain symbols that are prohibited in JS func names e.g. `/`, etc.

var schemas = {};
var schemaPath = path.join(process.cwd(), 'schema');
fs.readdirSync(schemaPath).forEach(function (file) {
  // schemas[file-name.js -> file-name]
  schemas[file.split('.').shift()] = require(path.join(schemaPath, file));
});
var assertions = [];

var addAssertions = function addAssertions(fileKey, _assertions) {
  var green = ['Class', 'DataProperty', 'ObjectProperty'];
  Object.keys(_assertions).forEach(function (assertionKey) {
    if (green.includes(_assertions[assertionKey].type)) {
      assertions.push({
        file: fileKey,
        key: assertionKey,
        assertion: _assertions[assertionKey]
      });
    }
  });
};

Object.keys(schemas).forEach(function (fileKey) {
  Object.keys(schemas[fileKey]).forEach(function (assertionType) {
    addAssertions(fileKey, schemas[fileKey][assertionType]());
  });
});
var source = Generator.generate(JSON.stringify(assertions));
fs.writeFileSync(path.join(process.cwd(), './generated/rlay-client/index.js'), source, 'utf8');
