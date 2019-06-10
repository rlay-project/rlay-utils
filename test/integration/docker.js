const childProcess = require("child_process");
const path = require("path");
const waitPort = require("wait-port");

const composeFilePath = path.join(__dirname, "./docker/docker-compose.yml");

const asyncSleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  if (process.env.CI) {
    console.log(
      "HACK: detecting port doesn't work well in CI, so instead we wait a fixed time"
    );
    return asyncSleep(30000).then(() => ({
      rlayClientRpcEndpoint: `http://localhost:${rlayClientPort}`
    }));
  }

  const waitForRlayClient = waitPort({
    kost: "127.0.0.1",
    port: rlayClientPort
    // output: "silent"
  });
  const waitForNeo4j = waitPort({
    host: "127.0.0.1",
    port: 7474
    // output: "silent"
  });
  return Promise.all([waitForRlayClient, waitForNeo4j])
    .then(() => {
      // even after the ports are available the nodes need a bit of time to get online
      return asyncSleep(30000);
    })
    .then(() => ({
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
  asyncSleep,
  dockerSetup,
  dockerTeardown
};
