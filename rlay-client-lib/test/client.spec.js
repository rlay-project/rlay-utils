/* eslint-env node, mocha */
const assert = require('assert');
const check = require('check-types');
const { Kafka } = require('kafkajs');
const sinon = require('sinon');
const { ClientBase } = require('../src/client.js');
const RlayEntities = require('../src/rlay');
const { Negative } = require('../src/negative');
const { mockClient } = require('./mocks/client');
const EntityMetaFactory = require('../src/entityMetaFactory');
const { SchemaPayload } = require('../src/schemaPayload.js');
const { Payload } = require('../src/payload.js');
const payloads = require('./assets/payloads');
const { cids } = require('./assets');

const {
  Entity,
  Rlay_ClassAssertion,
  Rlay_DataPropertyAssertion,
  Rlay_ObjectPropertyAssertion
} = RlayEntities;

const client = mockClient;

describe('Client', () => {
  describe('new', () => {
    it('should have the Rlay Entities exposed', async () => {
      // Remove `Entity` because it's prototype is not an instance of itself
      Object.keys(RlayEntities).slice(1).forEach(rlayEntityName => {
        assert(
          client[rlayEntityName].prototype instanceof Entity === true,
          `${rlayEntityName} is not exposed through client`
        );
      });
    });

    it('has `Rlay_Individual` also exposed as `Individual', async () => {
      assert.equal(client.Individual, client.Rlay_Individual);
    });

    it('has `Entity` exposed', async () => {
      assert.equal(client.Entity, Entity);
    });

    it('has `SchemaPayload` exposed', async () => {
      assert.equal(client.SchemaPayload, SchemaPayload);
    });

    it('has `Payload` exposed', async () => {
      assert.equal(client.Payload, Payload);
    });

    it('should have set the `.client` for all Rlay Entities', async () => {
      // Remove `Entity` because it's prototype is not an instance of itself
      Object.keys(RlayEntities).forEach(rlayEntityName => {
        assert(
          client[rlayEntityName].client instanceof ClientBase,
          `${rlayEntityName} does not have '.client' set`
        );
      });
    });
  });

  describe('.createEntity', () => {
    const rlayClient = new ClientBase();
    const kafkaClient = new Kafka({brokers: ['localhost']});
    const rlayKafkaConfig = {
      kafka: {
        producer: kafkaClient.producer(),
        topicName: 'test'
      }
    };
    const rlayClientKafka = new ClientBase(rlayKafkaConfig);
    let client, clientKafka, rlayStub, kafkaStub;
    beforeEach(async () => await client.createEntity(payloads.dataProperty));
    afterEach(() => kafkaStub.resetHistory());
    afterEach(() => rlayStub.resetHistory());

    context('with Kafka client', () => {
      before(() => {
        client = rlayClientKafka
        kafkaStub = sinon.stub(client.kafka.producer, 'send').resolves(true);
        rlayStub = sinon.stub(client.rlay, 'store').resolves('0x0000');
      });

      it('also sends payload to Kafka', async () => {
        assert(rlayStub.calledOnce);
        assert(kafkaStub.calledOnce);
        const _payload = new client.Payload(payloads.dataProperty, () => true);
        const cid = _payload.removeCid();
        assert.deepEqual(kafkaStub.args[0][0], {
          topic: client.config.kafka.topicName,
          messages: [
            {
              key: cid,
              value: JSON.stringify(_payload)
            }
          ]
        });
      });

      it('throws if invalid kafka config', () => {
        assert.throws(() => {
          const client = new ClientBase({ kafka: { topicName: 'test' }});
        }, Error, /invalid kafka config/u);
      });
    });

    context('without Kafka client', () => {
      before(() => client = rlayClient);

      it('only sends payload to Rlay', async () => {
        assert(rlayStub.calledOnce);
        assert(kafkaStub.notCalled);
      });
    });
  });

  describe('.createEntities', () => {
    const rlayClient = new ClientBase();
    const kafkaClient = new Kafka({brokers: ['localhost']});
    const rlayKafkaConfig = {kafka: {
      producer: kafkaClient.producer(),
      topicName: 'test' }};
    const rlayClientKafka = new ClientBase(rlayKafkaConfig);
    let client, clientKafka, rlayStub, kafkaStub;
    beforeEach(async () => client.createEntities([
      payloads.dataProperty,
      payloads.dataProperty,
    ]));
    afterEach(() => kafkaStub.resetHistory());
    afterEach(() => rlayStub.resetHistory());

    context('with Kafka client', () => {
      before(() => {
        client = rlayClientKafka
        kafkaStub = sinon.stub(client.kafka.producer, 'send').resolves(true)
        rlayStub = sinon.stub(client.rlay, 'storeEntities').resolves('0x0000');
      });

      it('also sends payload to Kafka', async () => {
        assert(rlayStub.calledOnce);
        assert(kafkaStub.calledOnce);
        const _payload = new client.Payload(payloads.dataProperty, () => true);
        const cid = _payload.removeCid();
        assert.deepEqual(kafkaStub.args[0][0], {
          topic: client.config.kafka.topicName,
          messages: [
            {
              key: cid,
              value: JSON.stringify(_payload)
            },
            {
              key: cid,
              value: JSON.stringify(_payload)
            }
          ]
        });
      });

      it('throws if invalid kafka config', () => {
        assert.throws(() => {
          const client = new ClientBase({ kafka: { topicName: 'test' }});
        }, Error, /invalid kafka config/u);
      });
    });

    context('without Kafka client', () => {
      before(() => client = rlayClient);

      it('only sends payload to Rlay', async () => {
        assert(rlayStub.calledOnce);
        assert(kafkaStub.notCalled);
      });
    });
  });

  describe('.isNegative', () => {
    context('negative value', () => {
      it('returns true', () => {
        assert.equal(mockClient.isNegative(mockClient.negative('value')), true);
      });
    });
    context('positive value', () => {
      it('returns false', () => {
        assert.equal(mockClient.isNegative('value'), false);
      });
    });
  });

  describe('.negative', () => {
    it('returns a negative instance', () => {
      assert.equal(mockClient.negative(
        mockClient.Rlay_DataProperty.from(payloads.clone(payloads.dataProperty))) instanceof Negative,
        true
      );
    });
  });

  describe('entityMetaFactory', () => {
    it('inherits from EntityMetaFactory', () => {
      assert.equal(mockClient instanceof EntityMetaFactory, true);
    });
  });

  describe('.initSchema', () => {
    context('no previous schema', () => {
      it('exposes them under .schema', () => {
        const schemaEntityKeys = Object.keys(client.schema);
        assert.equal(schemaEntityKeys.length, 120);
      });

      it('exposes cids for all', () => {
        const schemaEntityKeys = Object.keys(client.schema);
        schemaEntityKeys.forEach(key => {
          assert.equal(check.string(client.schema[key].cid), true);
        });
      });

      it('exposes entities for non-annotation payloads', () => {
        const schemaEntityKeys = Object.keys(client.schema);
        schemaEntityKeys.forEach(key => {
          if (!key.includes('Label') &&
            !key.includes('Description') &&
            !key.includes('AnnotationProperty')) {
            assert.equal(check.instance(client.schema[key], Entity), true);
          }
        });
      });
    });

    context('new additional cid & payload', () => {
      it('adds it to .schema', () => {
        const cids = { 'newDataProperty': '0x019480031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' };
        const payloads = [{
          key: 'newDataProperty',
          assertion: {
            type: 'DataProperty',
            annotations: []
          }
        }];
        client.initSchema(cids, payloads);
        const schemaEntityKeys = Object.keys(client.schema);
        assert.equal(schemaEntityKeys.length, 121);
      });
    });

    context('existing additional cid & payload', () => {
      it('does not add it to .schema', () => {
        const cids = { 'newDataProperty': '0x019480031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' };
        const payloads = [{
          key: 'newDataProperty',
          assertion: {
            type: 'DataProperty',
            annotations: []
          }
        }];
        client.initSchema(cids, payloads);
        const schemaEntityKeys = Object.keys(client.schema);
        assert.equal(schemaEntityKeys.length, 121);
      });
    });
  });

  describe('.initClient', () => {
    context('Class', () => {
      let keys;
      beforeEach(() => keys = Object.keys(client).
        filter(key => key.slice(-5) === 'Class').
        filter(key => key.slice(0, 4) !== 'Rlay')
      );

      it('creates correct amount of Rlay_ClassAssertions', () => {
        assert.equal(keys.length, 14);
      });

      it('attaches correct Rlay_ClassAssertion', () => {
        keys.forEach(key => {
          assert.equal(client[key].prototype instanceof Rlay_ClassAssertion, true);
        });
      });

      it('attaches correct .class field defaults', () => {
        keys.forEach(key => {
          assert.equal(client[key].fieldsDefault.class, cids[key], 'faulty default class');
        });
      });
    });

    context('DataProperty', () => {
      let keys;
      beforeEach(() => keys = Object.keys(client).
        filter(key => key.slice(-12) === 'DataProperty').
        filter(key => key.slice(0, 4) !== 'Rlay')
      );

      it('creates correct amount of Rlay_DataPropertyAssertions', () => {
        assert.equal(keys.length, 17);
      });

      it('attaches correct Rlay_DataPropertyAssertion', () => {
        keys.forEach(key => {
          assert.equal(client[key].prototype instanceof Rlay_DataPropertyAssertion, true);
        });
      });

      it('attaches correct .property field defaults', () => {
        keys.forEach(key => {
          assert.equal(client[key].fieldsDefault.property, cids[key], 'faulty default property');
        });
      });
    });

    context('ObjectProperty', () => {
      let keys;
      beforeEach(() => keys = Object.keys(client).
        filter(key => key.slice(-14) === 'ObjectProperty').
        filter(key => key.slice(0, 4) !== 'Rlay')
      );

      it('creates correct amount of Rlay_ObjectPropertyAssertions', () => {
        assert.equal(keys.length, 8);
      });

      it('attaches correct Rlay_ObjectPropertyAssertion', () => {
        keys.forEach(key => {
          assert.equal(client[key].prototype instanceof Rlay_ObjectPropertyAssertion, true);
        });
      });

      it('attaches correct .property field defaults', () => {
        keys.forEach(key => {
          assert.equal(client[key].fieldsDefault.property, cids[key], 'faulty default property');
        });
      });
    });
  });
});
