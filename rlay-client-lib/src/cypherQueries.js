const getWhereClause = relType => {
  if (relType === 'properties') {
    return 'NOT type(r) = "subject" AND NOT type(r) = "target"';
  }
  return 'type(r) = "subject" AND NOT type(r) = "target"'
}

const cypherQueries = {
  individualsByEntityAssertion: (entity, relType) => {
    const whereTypeClause = getWhereClause(relType);
    if (entity.type === 'ClassAssertion') {
      return `
      MATCH
      (i:Individual)-[r]-(a:RlayEntity)-[r1]-(s:RlayEntity {cid: "${entity.payload.class}"})
      WHERE
      ${whereTypeClause} AND
      type(r1) = "class"
      RETURN i.cid`;
    }
    if (entity.type === 'DataPropertyAssertion') {
      return `
      MATCH
      (i:Individual)-[r]-(a:RlayEntity)-[r1]-(s:RlayEntity {cid: "${entity.payload.property}"})
      WHERE
      ${whereTypeClause} AND
      type(r1) = "property" AND
      a.target = "${entity.payload.target}"
      RETURN i.cid`;
    }
    if (entity.type === 'ObjectPropertyAssertion') {
      return `
      MATCH
      (i:Individual)-[r]-(a:RlayEntity)-[r1]-(s:RlayEntity {cid: "${entity.payload.property}"})
      WHERE
      ${whereTypeClause} AND
      type(r1) = "property"
      MATCH
      (a)-[:target]-(o)
      WHERE
      o.cid = "${entity.payload.target}"
      RETURN i.cid`;
    }
    throw new Error(`invalid entity type (${entity.type}); supported are {ObjectPropertyAssertion, DataPropertyAssertion, ClassAssertion}`);
  },
  individualResolve: (entity, relType) => {
    const whereClause = getWhereClause(relType);
    return `
    MATCH
    (n:RlayEntity {cid: "${entity.cid}"})-[r]-(m:RlayEntity)
    WHERE
    ${whereClause}
    OPTIONAL MATCH
    (m:RlayEntity)-[:target]-(o:RlayEntity)
    WITH
    m.cid + COLLECT(o.cid) AS cids
    UNWIND cids AS cid
    RETURN DISTINCT cid`;
  }
}

module.exports = cypherQueries;
