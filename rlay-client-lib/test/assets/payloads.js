const rlayProp = {
  type: 'DataPropertyAssertion',
  cid: '0x019c80031b201eca64d262060a8f8914918c1191334f78834edfb4385fd03a91cf3a59c4dc04',
  annotations: [],
  subject: '0x00',
  property: '0x019480031b206a9cfaac8c40060e3e9a799df4d0788a1b7ce2f45640f962c23b36d2386b9560',
  target: '0x783a28414377414141506b465259424941334d356468434f464c74465044394d49452d71315f68686c592c4e414d455f5345415243482c6b77337629'
}

const rlayProp2 = {
  type: 'DataProperty',
  cid: '0x019480031b206a9cfaac8c40060e3e9a799df4d0788a1b7ce2f45640f962c23b36d2386b9560',
  annotations: [
    '0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0',
    '0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd'
  ],
  superDataPropertyExpression: []
}

const rlayClassAssertion = {
  type: 'ClassAssertion',
  cid: '0x01948003523515151',
  annotations: [],
  subject: '0x00',
  class: '0x018080031b204ab5aba7f85f0ab4047234981abb407fa63790f794dac5c73591d7f1c85c1511'
}

const rlayObjectAssertion = {
  type: 'ObjectPropertyAssertion',
  cid: '0x01948003523515152',
  annotations: [],
  subject: '0x00',
  property: '0x019280031b2054731141737e0ebbf25db560c2f1a5e61475c71c7d77a486c0eeeb4c3eaa19f6',
  target: '0x019680031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
}

const rlayDefaultIndividual = {
  annotations: [],
  class_assertions: [],
  negative_class_assertions: [],
  object_property_assertions: [],
  negative_object_property_assertions: [],
  data_property_assertions: [],
  negative_data_property_assertions: [],
  cid: '0x019680031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
  type: 'Individual'
}

const clone = obj => JSON.parse(JSON.stringify(obj));


const classAssertion = clone(rlayClassAssertion);
const negativeClassAssertion = clone({
  ...rlayClassAssertion,
  ...{ type: 'NegativeClassAssertion' }
});
const dataPropertyAssertion = clone(rlayProp);
const negativeDataPropertyAssertion = clone({
  ...rlayProp,
  ...{ type: 'NegativeDataPropertyAssertion' }
});
const objectPropertyAssertion = clone(rlayObjectAssertion);
const negativeObjectPropertyAssertion = clone({
  ...rlayObjectAssertion,
  ...{ type: 'NegativeObjectPropertyAssertion' }
});
const dataProperty = clone(rlayProp2);
const withCid = clone(rlayProp);
const withCidResolve = {};
withCidResolve[rlayProp.cid] = [clone(rlayProp), clone(rlayProp2)];

const withoutCid = clone(rlayProp);
withoutCid.cid = undefined

module.exports = {
  clone,
  defaultIndividual: clone(rlayDefaultIndividual),
  classAssertion,
  negativeClassAssertion,
  dataPropertyAssertion,
  negativeDataPropertyAssertion,
  objectPropertyAssertion,
  negativeObjectPropertyAssertion,
  withCid,
  withCidResolve,
  withoutCid,
  '0x00': null,
  // one of the rlay bultins
  '0x019780031b20e77fddce0bc5ecd30e3959d43d9dc36ef5448a113b7524621bac9053c02b3319': null,
  // one of the rlay bultins
  '0x019780031b20b3179194677268c88cfd1644c6a1e100729465b42846a2bf7f0bddcd07e300a9': null,
  '0x018080031b204ab5aba7f85f0ab4047234981abb407fa63790f794dac5c73591d7f1c85c1511': {
    type: 'Class',
    cid: '0x018080031b204ab5aba7f85f0ab4047234981abb407fa63790f794dac5c73591d7f1c85c1511',
    annotations: [
      '0x019580031b20ee17879135dedbeb6e7e189c971a283d2376651d2f3c5cbfdc24d0ea751c8453',
      '0x019580031b209e2537e34bcd8d2287f9bbbc5335ec741a619c0187825d06ca283d2a9d0bd6dc'
    ],
    superClassExpression: []
  },
  dataProperty,
  '0x019480031b206a9cfaac8c40060e3e9a799df4d0788a1b7ce2f45640f962c23b36d2386b9560': clone(dataProperty),
  '0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0': {
    type: 'Annotation',
    cid: '0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0',
    annotations: [],
    property: '0x019780031b20b3179194677268c88cfd1644c6a1e100729465b42846a2bf7f0bddcd07e300a9',
    value: '0x6b5265717565737420555249'
  },
  '0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd': {
    type: 'Annotation',
    cid: '0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd',
    annotations: [],
    property: '0x019780031b20e77fddce0bc5ecd30e3959d43d9dc36ef5448a113b7524621bac9053c02b3319',
    value: '0x78255265717565737420555249207468617420697320616e206162736f6c75746520706174682e'
  },
  '0x019680031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470': clone(rlayDefaultIndividual)
};
