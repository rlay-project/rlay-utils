/* eslint-env node, mocha */
const assert = require('assert');
const Client = require('../../mocks/client');
const client = Client.mockClient;

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
});
