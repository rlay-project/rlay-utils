export default class Generator {
  static generate (schemaCIDs, schema) {
    return `
    const { Client } = require('@rlay/rlay-client-lib');

    const client = new Client();
    const schemaCIDs = ${schemaCIDs};
    const schema = ${schema};

    client.initSchema(schemaCIDs, schema);
    client.initClient();

    module.exports = client;`
  }
}
