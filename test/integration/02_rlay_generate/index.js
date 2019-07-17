const fs = require("fs");
const path = require("path");
const assert = require("assert");
const childProcess = require("child_process");

const { babelNodeCmdPath, rlayGenerateCmdPath } = require("../shared");

describe("rlay-generate", () => {
  context("correct seed file", () => {
    after(() => {
      // clean up 'rlay-client.js' file
      fs.unlinkSync(path.join(__dirname, "./data/rlay-client.js"));
    });

    it("correctly generates rlay-client file", () => {
      const seedFileOutputPath = path.join(
        __dirname,
        "./data/seed_output.json"
      );
      const seedFilePath = path.join(__dirname, "./data/seed.js");
      const outputPath = path.join(__dirname, "./data/rlay-client.js");

      const cmdResult = childProcess.spawnSync(
        babelNodeCmdPath,
        [
          rlayGenerateCmdPath,
          "--seed-file-output",
          seedFileOutputPath,
          "--seed-file",
          seedFilePath,
          "--output",
          outputPath
        ],
        { encoding: "utf-8" }
      );

      assert.equal("", cmdResult.stdout);
      assert.equal(0, cmdResult.status, "should run successfully");
    });

    it("can require the generated rlay-client correctly", async () => {
      const outputPath = path.join(__dirname, "./data/rlay-client.js");
      const client = require(outputPath);

      assert.equal(client.getClient instanceof Function, true);
    });

    it("can create Entities via the client and schema", async () => {
      const outputPath = path.join(__dirname, "./data/rlay-client.js");
      const client = require(outputPath);

      const indi = await client.Individual.create({
        httpConnectionClass: true
      });
      const assertCid =
        "0x019680031b2004db02acb784cda01405eb1148592070fc27e5ae608a96efa94d4cc4698013be";

      assert.equal(indi.cid, assertCid);
    });

    it.skip("can create Entities with different values", async () => {
      const outputPath = path.join(__dirname, "./data/rlay-client.js");
      const client = require(outputPath);

      const indi1 = await client.Individual.create({
        httpConnectionClass: true
      });
      const indi2 = await client.Individual.create({
        httpConnectionClass: false
      });

      assert.notEqual(indi1.cid, indi2.cid);
    });
  });
});
