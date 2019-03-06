const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//module.exports = class Generator {
export default class Generator {
  static generate (assertions) {
    return `
    const fs = require('fs');
    const path = require('path');
    const { Client } = require('rlay-client-lib');
    const schemaSeeded = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../build/schema/seed.json'), 'utf8'));

    const client = new Client();
    const assertions = ${assertions};
    assertions.forEach(assertion => {
      client.initSchema(assertion.key, assertion.assertion);
    });

    module.exports = client;`
  }
}
