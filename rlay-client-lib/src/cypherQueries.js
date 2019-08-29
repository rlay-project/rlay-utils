const getWhereClause = (relType, rElm) => {
  if (relType === 'properties') {
    return `NOT type(${rElm}) = "subject" AND NOT type(${rElm}) = "target"`
  }
  return `type(${rElm}) = "subject" AND NOT type(${rElm}) = "target"`
}

const cypherQueries = {
  individualsByEntityAssertion: (entities, relType) => {
    return entities.map((entity, _i) => {
      const i = _i + 1;
      const whereTypeClause = getWhereClause(relType, `r${i}1`);
      if (entity.type === 'ClassAssertion') {
        return `
        MATCH
        (i:Individual)-[r${i}1]-(a${i}:RlayEntity)-[r${i}2]-(:RlayEntity {cid: "${entity.payload.class}"})
        WHERE
        ${whereTypeClause} AND
        type(r${i}2) = "class"`;
      }
      if (entity.type === 'DataPropertyAssertion') {
        return `
        MATCH
        (i:Individual)-[r${i}1]-(a${i}:RlayEntity)-[r${i}2]-(:RlayEntity {cid: "${entity.payload.property}"})
        WHERE
        ${whereTypeClause} AND
        type(r${i}2) = "property" AND
        a${i}.target = "${entity.payload.target}"`;
      }
      if (entity.type === 'ObjectPropertyAssertion') {
        return `
        MATCH
        (i:Individual)-[r${i}1]-(a${i}:RlayEntity)-[r${i}2]-(:RlayEntity {cid: "${entity.payload.property}"})
        WHERE
        ${whereTypeClause} AND
        type(r${i}2) = "property"
        MATCH
        (a${i})-[:target]-(o${i})
        WHERE
        o${i}.cid = "${entity.payload.target}"`;
      }
      throw new Error(`invalid entity type (${entity.type}); supported are {ObjectPropertyAssertion, DataPropertyAssertion, ClassAssertion}`);
    }).reduce((all, one) => all + one, '') + ' RETURN i.cid';
  },
  individualResolve: (entity, relType) => {
    const whereClause = getWhereClause(relType, 'r');
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
