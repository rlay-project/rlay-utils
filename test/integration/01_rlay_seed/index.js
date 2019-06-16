const assert = require("assert");
const childProcess = require("child_process");
const path = require("path");

const { babelNodeCmdPath, rlaySeedCmdPath } = require("../shared");

describe("rlay-seed", () => {
  it("correctly seeds with an empty seed file", () => {
    const inputPath = path.join(__dirname, "./data/empty_seed.json");
    const cmdResult = childProcess.spawnSync(
      babelNodeCmdPath,
      [rlaySeedCmdPath, "--input", inputPath],
      { encoding: "utf-8" }
    );

    assert.equal(0, cmdResult.status, "should run successfully");
    assert.equal("{}\n", cmdResult.stdout);
  });

  it("correctly seeds with a simple seed file and Neo4J backend", () => {
    const inputPath = path.join(__dirname, "./data/simple_seed.js");
    const cmdResult = childProcess.spawnSync(
      babelNodeCmdPath,
      [rlaySeedCmdPath, "--input", inputPath, "--backend", "myneo4j"],
      {
        encoding: "utf-8"
      }
    );

    assert.equal(0, cmdResult.status, "should run successfully");
    const output = JSON.parse(cmdResult.stdout);
    assert.equal(3, Object.keys(output).length);
  });

  it("correctly seeds with a seed file with imports (not included in output)", () => {
    const inputPath = path.join(__dirname, "./data/with_import.js");
    const cmdResult = childProcess.spawnSync(
      babelNodeCmdPath,
      [rlaySeedCmdPath, "--input", inputPath, "--backend", "myneo4j"],
      {
        encoding: "utf-8"
      }
    );

    assert.equal(0, cmdResult.status, "should run successfully");
    const output = JSON.parse(cmdResult.stdout);
    assert.equal(1, Object.keys(output).length);
  });

  it("correctly seeds with a seed file with imports (included in output)", () => {
    const inputPath = path.join(__dirname, "./data/with_import_output.js");
    const cmdResult = childProcess.spawnSync(
      babelNodeCmdPath,
      [rlaySeedCmdPath, "--input", inputPath, "--backend", "myneo4j"],
      {
        encoding: "utf-8"
      }
    );

    assert.equal(0, cmdResult.status, "should run successfully");
    const output = JSON.parse(cmdResult.stdout);
    assert.equal(4, Object.keys(output).length);
  });
});
