const assert = require("assert");
const nock = require("nock");
const path = require("path");

const { mainWithConfig } = require("../src/commands/seed_from_file");

describe("rlay-seed", () => {
  it("can correctly seed a single entity", async () => {
    const getEntityRequest = nock("http://localhost:8546")
      .post("/", body => body.method === "rlay_experimentalGetEntity")
      .reply(
        200,
        JSON.stringify({
          jsonrpc: "2.0",
          result: null,
          id: 1
        })
      );

    const storeEntityRequest = nock("http://localhost:8546")
      .post("/", body => body.method === "rlay_experimentalStoreEntity")
      .reply(
        200,
        JSON.stringify({
          jsonrpc: "2.0",
          result:
            "0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
          id: 2
        })
      );

    const nameCidMap = await mainWithConfig({
      rpcUrl: "http://localhost:8546",
      backend: "myneo4j",
      inputFilePath: path.join(__dirname, "./data/single_entity_seed.json")
    });

    assert.equal(
      nameCidMap["foo"],
      "0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    );

    assert(getEntityRequest.isDone());
    assert(storeEntityRequest.isDone());
  });
});
