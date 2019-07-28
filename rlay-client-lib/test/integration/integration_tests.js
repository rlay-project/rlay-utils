"use strict";

const Mocha = require("mocha");
const Web3 = require("web3");
const { dockerSetup, dockerTeardown } = require("./docker");
const shared = require("./shared");

const runTests = async () => {
  const mocha = new Mocha({
    timeout: false
  });

  console.warn(
    "If this is the first time running the tests on this machine, this step might take a while, as Docker downloads a required image for the tests.\n\nYou should also make sure to run `npm run test:dockerimage` to build a up-to-date integration test image."
  );
  const { rlayClientRpcEndpoint } = await dockerSetup();
  shared.rpcEndpoint = rlayClientRpcEndpoint;

  Mocha.utils
    .lookupFiles(__dirname, ["js"], true)
    .filter(file => file.substr(-20) !== "integration_tests.js")
    .forEach(file => {
      mocha.addFile(file);
    });

  mocha.run(failures => {
    dockerTeardown();
    process.exitCode = failures ? 1 : 0;
  });
};

runTests();
