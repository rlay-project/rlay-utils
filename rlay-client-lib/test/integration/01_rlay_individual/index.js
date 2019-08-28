/* eslint-env node, mocha */
const assert = require('assert');
const Client = require('../../mocks/client');
const client = Client.mockClient;
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
      const clone = x => JSON.parse(JSON.stringify(x))
      const indi = await client.Rlay_Individual.create(clone(properties));
      const objIndi1 = await client.Rlay_Individual.create(clone(properties1));
      await indi.assert({
        httpConnectionClass: true,
        httpEntityHeaderClass: true,
        httpRequestsObjectProperty: objIndi1
      });
      await indi.resolve();
      await objIndi1.resolve();
      assert.deepEqual(indi.properties, properties);
      assert.deepEqual(objIndi1.properties, properties1);
      assert.equal(indi.httpRequestsObjectProperty instanceof client.Rlay_Individual, true);
      assert.equal(indi.httpConnectionClass, true);
      assert.equal(indi.httpEntityHeaderClass, true);
      assert.equal(indi.httpStatusCodeValueDataProperty, undefined);
    });
  });

  describe('.findByAssertion', () => {
    it('works as expected', async () => {
      const properties = { httpStatusCodeValueDataProperty: 200 };
      const indi = await client.Rlay_Individual.create(JSON.parse(JSON.stringify(
        properties)));
      const objIndi1 = await client.Rlay_Individual.create({
        httpStatusCodeValueDataProperty: 400
      });
      await indi.assert({
        httpConnectionClass: true,
        httpEntityHeaderClass: true,
        httpRequestsObjectProperty: objIndi1
      });
      const searchResult = await client.Rlay_Individual.findByAssertion({
        httpStatusCodeValueDataProperty: 200
      });
      assert.equal(searchResult.properties.length, 2);
      assert.equal(searchResult.assertions.length, 0);
      assert.equal(check.all(searchResult.properties.map(entity => {
        return entity instanceof client.Rlay_Individual
      })), true, 'search results are not Individuals');
    });
  });
});
