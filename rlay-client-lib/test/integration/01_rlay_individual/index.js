/* eslint-env node, mocha */
const assert = require('assert');
//const Client = require('../../mocks/client');
//const client = Client.mockClient;
//client.config.storeLimit = 1;
const { Client } = require('../../../src/index.js');
const generateClient = require('../../seed/generated/generateRlayClient.js');
const client = generateClient(new Client());
const check = require('check-types');

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

const clone = x => JSON.parse(JSON.stringify(x))

describe('Rlay_Individual', () => {
  describe('.create', () => {
    context('same property payload', () => {
      it('produces same CID', async () => {
        const objIndi1 = client.getEntityFromPayload(defaultPayload);
        const objIndi2 = client.Rlay_Individual.from(defaultPayload);
        const indi1 = await client.Rlay_Individual.create({
          httpConnectionClass: true,
          httpStatusCodeValueDataProperty: 200,
          httpRequestsObjectProperty: objIndi1
        });
        const indi2 = await client.Rlay_Individual.create({
          httpConnectionClass: false,
          httpStatusCodeValueDataProperty: 200,
          httpRequestsObjectProperty: objIndi2
        });
        assert.equal(indi1.cid, indi2.cid);
      });
    });
    context('different property payload', () => {
      it('produces different CIDs', async () => {
        const indi1 = await client.Rlay_Individual.create({
          httpStatusCodeValueDataProperty: 201
        });
        const indi2 = await client.Rlay_Individual.create({
          httpStatusCodeValueDataProperty: 202
        });
        assert.notEqual(indi1.cid, indi2.cid);
      });
    });
  });

  describe('.resolve', () => {
    it('works as expected', async () => {
      const properties = { httpStatusCodeValueDataProperty: 200 };
      const properties1 = { httpStatusCodeValueDataProperty: 400 };
      const indi = await client.Rlay_Individual.create(clone(properties));
      const objIndi1 = await client.Rlay_Individual.create(clone(properties1));
      await indi.assert({
        httpConnectionClass: true,
        httpEntityHeaderClass: true,
        httpStatusCodeValueDataProperty: 599,
        httpRequestsObjectProperty: objIndi1
      });
      await indi.resolve();
      await objIndi1.resolve();
      assert.deepEqual(indi.properties, properties);
      assert.deepEqual(objIndi1.properties, properties1);
      assert.equal(indi.httpRequestsObjectProperty instanceof client.Rlay_Individual, true);
      assert.equal(indi.httpConnectionClass, true);
      assert.equal(indi.httpEntityHeaderClass, true);
      assert.equal(indi.httpStatusCodeValueDataProperty, 599);
    });
  });

  describe('.findByAssertion', () => {
    context('property assertions', () => {
      context('ClassAssertion', () => {
        it('works as expected', async () => {
          const searchResult = await client.Rlay_Individual.findByAssertion({
            httpConnectionClass: true
          });
          assert.equal(searchResult.asProperty.length, 1);
          assert.equal(check.all(searchResult.asProperty.map(entity => {
            return entity instanceof client.Rlay_Individual
          })), true, 'search results are not Individuals');
        });
      });
      context('DataPropertyAssertion', () => {
        it('works as expected', async () => {
          const searchResult = await client.Rlay_Individual.findByAssertion({
            httpStatusCodeValueDataProperty: 200
          });
          assert.equal(searchResult.asProperty.length, 2);
          assert.equal(check.all(searchResult.asProperty.map(entity => {
            return entity instanceof client.Rlay_Individual
          })), true, 'search results are not Individuals');
        });
      });
      context('ObjectPropertyAssertion', () => {
        it('works as expected', async () => {
          const indi = client.getEntityFromPayload(defaultPayload);
          const searchResult = await client.Rlay_Individual.findByAssertion({
            httpRequestsObjectProperty: indi
          });
          assert.equal(searchResult.asProperty.length, 1);
          assert.equal(check.all(searchResult.asProperty.map(entity => {
            return entity instanceof client.Rlay_Individual
          })), true, 'search results are not Individuals');
        });
      });
    });

    context('assert assertions', () => {
      context('ClassAssertion', () => {
        it('works as expected', async () => {
          const searchResult = await client.Rlay_Individual.findByAssertion({
            httpConnectionClass: true
          });
          assert.equal(searchResult.asAssertion.length, 1);
          assert.equal(check.all(searchResult.asAssertion.map(entity => {
            return entity instanceof client.Rlay_Individual
          })), true, 'search results are not Individuals');
        });
      });

      context('DataPropertyAssertion', () => {
        it('works as expected', async () => {
          const searchResult = await client.Rlay_Individual.findByAssertion({
            httpStatusCodeValueDataProperty: 599
          });
          assert.equal(searchResult.asAssertion.length, 1);
          assert.equal(check.all(searchResult.asAssertion.map(entity => {
            return entity instanceof client.Rlay_Individual
          })), true, 'search results are not Individuals');
        });
      });

      context('ObjectPropertyAssertion', () => {
        it('works as expected', async () => {
          const clonedDefault = clone(defaultPayload);
          clonedDefault.annotations.push('0x00');
          const objIndi = client.getEntityFromPayload(clonedDefault);
          const indi = await client.Rlay_Individual.create({
            httpEntityHeaderClass: true,
          });
          await indi.assert({httpRequestsObjectProperty: objIndi});
          const searchResult = await client.Rlay_Individual.findByAssertion({
            httpRequestsObjectProperty: objIndi
          });
          assert.equal(searchResult.asAssertion.length, 1);
          assert.equal(searchResult.asAssertion[0].cid, indi.cid);
          assert.equal(check.all(searchResult.asAssertion.map(entity => {
            return entity instanceof client.Rlay_Individual
          })), true, 'search results are not Individuals');
        });
      });
    });

    context('multiple assertions', () => {
      it('works as expected', async () => {
        const objIndi = client.getEntityFromPayload(defaultPayload);
        const searchResult = await client.Rlay_Individual.findByAssertion({
          httpStatusCodeValueDataProperty: 200,
          httpConnectionClass: true,
          httpRequestsObjectProperty: objIndi
        });
        assert.equal(searchResult.asProperty.length, 1);
        assert.equal(check.all(searchResult.asProperty.map(entity => {
          return entity instanceof client.Rlay_Individual
        })), true, 'search results are not Individuals');
      });
    });
  });
});
