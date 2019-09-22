const mockClient = require('../seed/generated/rlay-client.js');

// we are loading the seeded cids and schema directly from the generated client
// this way we don't have to copy data from the generated/rlay-client.js file
// everytime we are changing the seed examples for the test suite.

const schemaIds = Object.keys(mockClient.schema);
const cids = {};
schemaIds.forEach(id => cids[id] = mockClient.schema[id].cid);

const schema = schemaIds.map(id => ({
  key: id,
  assertion: mockClient.schema[id].payload
})).filter(obj => obj.assertion);

module.exports = {
  cids,
  schema
}
