#!/usr/bin/env node

const Web3 = require("web3");
const rlay = require("@rlay/web3-rlay");
const redis = require("redis");
const JsonRPC = require("simple-jsonrpc-js");
const WebSocket = require("ws");
const pLimit = require("p-limit");

const mainWithConfig = async () => {
  const program = require("yargs")
    .env()
    .option("index", {
      demandOption: true,
      describe: "Name of the redisearch index"
    })
    .option("rpc-url", {
      describe: "URL of JSON-RPC endpoint"
    })
    .default("rpc-url", "http://localhost:8546")
    .option("ws-rpc-url", {
      describe: "URL of JSON-RPC Websocket endpoint"
    })
    .default("ws-rpc-url", "ws://localhost:8547");

  const config = program.argv;

  const web3 = new Web3(config.rpcUrl);
  rlay.extendWeb3WithRlay(web3);

  const client = redis.createClient();

  const retrieveLimit = pLimit(50);
  const retrieve = cid => {
    return retrieveLimit(() => rlay.retrieve(web3, cid));
  };

  const getLabel = async entity => {
    const annotations = await Promise.all(entity.annotations.map(retrieve));
    const annotationLabel = annotations.find(
      n => n.property === rlay.builtins.labelAnnotationProperty
    );
    if (!annotationLabel) {
      return null;
    }
    return rlay.decodeValue(annotationLabel.value);
  };

  const enrichedEntity = async entity => {
    const labelPr = getLabel(entity).then(label => (entity.label = label));
    return Promise.all([labelPr]).then(() => entity);
  };

  const processIncomingEntity = entity => {
    enrichedEntity(entity).then(entity => {
      client.send_command("FT.ADD", [
        config.index,
        entity.cid,
        "1.0",
        "REPLACE",
        "FIELDS",
        ...(entity.label ? ["label", entity.label] : []),
        ...["cid", entity.cid],
        ...["type", entity.type]
      ]);
    });
  };

  const startJsonRpc = () => {
    const jrpc = new JsonRPC();
    const socket = new WebSocket(config.wsRpcUrl);

    jrpc.on("rlay_subscribeEntities", ["entity"], processIncomingEntity);

    socket.onmessage = function(event) {
      jrpc.messageHandler(event.data);
    };

    jrpc.toStream = function(_msg) {
      console.log("_msg", _msg);
      socket.send(_msg);
    };

    socket.onerror = function(error) {
      console.error("Error: " + error.message);
    };

    socket.onopen = function() {
      //calls
      jrpc
        .call("rlay_subscribeEntities", [{ fromBlock: 0 }])
        .then(function(result) {
          console.log("open", result);
        });
    };
  };

  const main = async () => {
    await new Promise((resolve, reject) => {
      client.send_command("FT.DROP", [config.index], (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    }).catch(err => {
      console.log("ERROR during index creation:", err);
    });
    await new Promise((resolve, reject) => {
      client.send_command(
        "FT.CREATE",
        [
          config.index,
          "SCHEMA",
          ...["label", "TEXT", "WEIGHT", "3.0"],
          ...["cid", "TEXT"],
          ...["type", "TEXT", "WEIGHT", "1.0"]
        ],
        (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        }
      );
    });
    startJsonRpc();
  };

  await main();
};

mainWithConfig();
