const childProcess = require("child_process");
const path = require("path");
const promiseRetry = require("promise-retry");
const jayson = require("jayson/promise");

const composeFilePath = path.join(__dirname, "./docker/docker-compose.yml");

const waitForRpc = port => {
  return promiseRetry(function(retry, number) {
    if (process.env.TEST_STDOUT) {
      console.log("RPC connect attempt number", number);
    }

    const client = jayson.client.http({
      port
    });

    return client.request("rlay_version", []).catch(retry);
  });
};

const dockerSetup = () => {
  const dockerCompose = childProcess.spawn("docker-compose", [
    "-f",
    composeFilePath,
    "up",
    "--force-recreate"
  ]);

  if (process.env.TEST_STDOUT) {
    dockerCompose.stdout.on("data", data => {
      process.stdout.write(data);
    });
    dockerCompose.stderr.on("data", data => {
      process.stderr.write(data);
    });
  }
  dockerCompose.on("close", code => {
    if (code !== 0) {
      throw new Error(
        `docker-compose up failed with code ${code}\nRun again with TEST_STDOUT=1 for more information.`
      );
    }
  });

  const rlayClientPort = 8546;
  const waitForRlayClient = waitForRpc(rlayClientPort);

  return Promise.all([waitForRlayClient]).then(() => ({
    rlayClientRpcEndpoint: `http://localhost:${rlayClientPort}`
  }));
};

const dockerTeardown = () => {
  const dockerComposeDown = childProcess.spawnSync("docker-compose", [
    "-f",
    composeFilePath,
    "down"
  ]);
  if (process.env.TEST_STDOUT) {
    process.stdout.write(dockerComposeDown.stdout);
    process.stderr.write(dockerComposeDown.stderr);
  }
};

module.exports = {
  dockerSetup,
  dockerTeardown
};
