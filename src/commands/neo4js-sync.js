#!/usr/bin/env node

const Web3 = require("web3");
const rlay = require("@rlay/web3-rlay");
const neo4j = require("neo4j-driver").v1;

const web3 = new Web3(process.env.RPC_URL || "http://localhost:8546");
rlay.extendWeb3WithRlay(web3);

const retrieve = cid => {
  return rlay.retrieve(web3, cid);
};

const upsertEntity = (client, graph, kind, fields) => {
  let query = "";
  query = query + "MERGE (";
  query = query + `:${kind} {`;
  Object.keys(fields).forEach((key, i) => {
    query = query + `${key}: '${fields[key]}'`;
    if (i !== Object.keys(fields).length - 1) {
      query = query + ",";
    }
  });
  query = query + "})";

  return client.run(query);
};

const upsertEdge = (client, graph, entityA, entityB, edge) => {
  let query = "";
  query = query + "MATCH ";
  query = query + `(a:${entityA.type} {cid: '${entityA.cid}'})`;
  query = query + ",";
  query = query + `(b:${entityB.type} {cid: '${entityB.cid}'})`;
  query = query + "\n";
  query = query + `CREATE (a)-[${edge}]->(b)`;

  return client.send_command("GRAPH.QUERY", [graph, query]);
};

const main = async () => {
  // const client = redis.createClient();
  const uri = "bolt://localhost";
  const user = "neo4j";
  const password = "toasty123";
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  const annotationPropertyCids = await web3.rlay.experimentalListCids(
    "AnnotationProperty"
  );
  const annotationProperties = await Promise.all(
    annotationPropertyCids.map(retrieve)
  );
  const annotationCids = await web3.rlay.experimentalListCids("Annotation");
  const annotations = await Promise.all(annotationCids.map(retrieve));

  await Promise.all(
    annotations.map(entity =>
      upsertEntity(session, "testont2", entity.type, {
        cid: entity.cid,
        value: rlay.decodeValue(entity.value)
      })
    )
  );
  await Promise.all(
    annotationProperties.map(entity =>
      upsertEntity(session, "testont2", entity.type, {
        cid: entity.cid
      })
    )
  );

  // await Promise.all(
  // annotations.map(entity =>
  // upsertEdge(
  // session,
  // "testont2",
  // entity,
  // { type: "AnnotationProperty", cid: entity.property },
  // ":property"
  // )
  // )
  // );

  const individualCids = await web3.rlay.experimentalListCids("Individual");
  const individuals = await Promise.all(individualCids.map(retrieve));
  await Promise.all(
    individuals.map(async entity => {
      await upsertEntity(session, "testont2", entity.type, { cid: entity.cid });
      // await Promise.all(
      // entity.annotations.map(annotation =>
      // upsertEdge(
      // session,
      // "testont2",
      // entity,
      // { type: "Annotation", cid: annotation },
      // ":annotation"
      // )
      // )
      // );
    })
  );

  console.log("done");
  driver.close();
};

main();
