const Web3 = require('web3');
const pLimit = require('p-limit');
const rlay = require('@rlay/web3-rlay');

const address = '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13';

const web3 = new Web3(process.env.RPC_URL || 'http://localhost:8546');
rlay.extendWeb3WithRlay(web3);
web3.eth.defaultAccount = address;

const storeLimit = pLimit(50);

// `Create`

const createIndividual = params => Object.assign(params, { type: 'Individual', })

const createClassAssertion = params => ({
  type: 'ClassAssertion',
  subject: params.subject,
  class: params.class,
});

const createDataPropertyAssertion = params => ({
  type: 'DataPropertyAssertion',
  subject: params.subject,
  property: params.property,
  target: rlay.encodeValue(params.target),
});

const createObjectPropertyAssertion = params => ({
  type: 'ObjectPropertyAssertion',
  subject: params.subject,
  property: params.property,
  target: params.target,
});

// `Store`

const storeEntity = async entity => {
  //return storeLimit(async () => {
  const cid = await rlay.store(web3, entity, { backend: 'myneo4j' });
  return cid;
  //})
};

const storeAnnotation = params => storeEntity(createAnnotation(params));
const storeClass = params => storeEntity(createClass(params));
const storeIndividual = params => storeEntity(createIndividual(params));
const storeClassAssertion = params => storeEntity(createClassAssertion(params));
const storeDataPropertyAssertion = params => storeEntity(createDataPropertyAssertion(params));
const storeObjectPropertyAssertion = params => storeEntity(createObjectPropertyAssertion(params));

module.exports = {
  createClass,
  createIndividual,
  createClassAssertion,
  createDataPropertyAssertion,
  createObjectPropertyAssertion,

  storeEntity,
  storeIndividual,
  storeClassAssertion,
  storeDataPropertyAssertion,
  storeObjectPropertyAssertion,
};
