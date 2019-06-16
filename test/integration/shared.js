const path = require("path");

module.exports = {
  babelNodeCmdPath: path.join(__dirname, "../../node_modules/.bin/babel-node"),
  rlaySeedCmdPath: path.join(__dirname, "../../src/commands/seed_from_file.js"),

  rpcEndpoint: null
};
