const path = require("path");

module.exports = {
  babelNodeCmdPath: path.join(__dirname, "../../node_modules/.bin/babel-node"),
  rlaySeedCmdPath: path.join(__dirname, "../../src/commands/seed_from_file.js"),
  rlayGenerateCmdPath: path.join(__dirname, "../../src/commands/generate/index.js"),
  rpcEndpoint: null
};
