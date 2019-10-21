/* eslint-env node, mocha */
const assert = require('assert');
const { Client } = require('../../../src/index.js');
const generateClient = require('../../seed/generated/generateRlayClient.js');
const { Kafka } = require('kafkajs');
const config = require('../../../config.js');

const kafkaClient = new Kafka({
  brokers: [config.get('services.kafka.host')],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: config.get('services.kafka.confluence_api_key'),
    password: config.get('services.kafka.confluence_api_secret')
  }
});

const producer = kafkaClient.producer()

let client;

const defaultPayload = {
  "annotations": [],
  "class_assertions": [],
  "negative_class_assertions": [],
  "object_property_assertions": [],
  "negative_object_property_assertions": [],
  "data_property_assertions": [],
  "negative_data_property_assertions": [],
  "type": "Individual"
}

describe('Rlay_Individual', () => {
  before(async () => {
    await producer.connect();
    client = generateClient(new Client({
      kafka: {
        producer: producer,
        topicName: config.get('services.kafka.topic_name')
      }
    }));
  });

  describe('.create', () => {
    context('same property payload', () => {
      it('produces same CID', async () => {
        return client.Rlay_Individual.create({
          httpConnectionClass: true,
        });
        // should create two messages at Kafka
      });
    });
  });
});
