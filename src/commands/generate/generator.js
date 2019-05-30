export default class Generator {
  static generate (schemaCIDs, schema) {
    return `
    const { Client } = require('@rlay/rlay-client-lib');
    const map = new Map();

    const getClient = (config) => {
      const stringConfig = JSON.stringify(config);
      if (map.has(stringConfig)) {
        return map.get(stringConfig);
      } else {
        const client = new Client(config);
        const schemaCIDs = ${schemaCIDs};
        const schema = ${schema};

        client.initSchema(schemaCIDs, schema);
        client.initClient();

        map.set(stringConfig, client);
        return getClient(config);
      }
    }

    const t = getClient({});
    t.getClient = getClient;

    module.exports = t;`;
  }
}
