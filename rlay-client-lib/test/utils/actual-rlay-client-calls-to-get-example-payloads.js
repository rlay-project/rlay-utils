const client = require('../seed/generated/rlay-client');
const { cids, schema } = require('../assets');
const pLimit = require('p-limit');

const limit = pLimit(1);
const cidKeys = schema.map(o => o.key);

const main = async () => {
  await Promise.all(cidKeys.slice(0, 25).map(async cidKey => {
    return limit(async () => {
      console.log();
      console.log('CID:', cids[cidKey]);
      console.log('CID Key:', cidKey);
      console.log('Schema:', schema.filter(o => o.key === cidKey).pop().assertion);
      console.log('Server:', await client.findEntityByCID(cids[cidKey]));
    })
  }));
}

main()
