const assert = require('assert');
const simple = require('simple-mock');
const { Rlay_Individual, Entity } = require('../src/rlay');
const { Client } = require('../src/client');
const { cids, schema } = require('./assets');
const { UnknownEntityError } = require('../src/errors');

let client;
const testObj = Rlay_Individual;
const testObjType = 'Individual';
const defaultPayload = {
  "annotations": [],
  "class_assertions": [],
  "negative_class_assertions": [],
  "object_property_assertions": [],
  "negative_object_property_assertions": [],
  "data_property_assertions": [],
  "negative_data_property_assertions": [],
  "type": testObjType
};

describe('Rlay_Individual', () => {

  beforeEach(() => {
    client = new Client();
    client.initSchema(cids, schema);
    client.initClient();
  })

  beforeEach(() => {
    // mock it
    simple.mock(client, 'createEntity').callFn(
      async () => Promise.resolve('0x0000')
    );
    /*
    simple.mock(client, 'findEntityByCID').callFn(
      async () => Promise.resolve({
        type: 'DataProperty',
        annotations:
        [
          '0x019580031b20d3af56cf7f30f98f5a22f969cf8cdc63de86eb11ca69dae9e8734d2d51abe8fb',
          '0x019580031b20af5050cc610e78eac40165d6c199980f4f347d0f227d624a1160bf8d126301ed'
        ],
        superDataPropertyExpression: [] }
      )
    );
    */
  });

  it('should inherit `Entity`', () => {
    assert.equal(testObj.prototype instanceof Entity, true);
  });

  it('should have `.client` defined', () => {
    assert.equal(testObj.client instanceof Client, true);
  });

  it('should have `.intermediate` defined', () => {
    assert.equal(testObj.intermediate instanceof Object, true);
  });

  describe('static .create', () => {

    const payload = {
      httpConnectionClass: true,
      httpEntityHeaderClass: true
    };
    let result;
    let callArg;

    beforeEach(async () => {
      result = await testObj.create(payload);
      callArg = client.createEntity.lastCall.arg;
    });

    it('should call `client.createEntity` to create the Entity', async () => {
      assert.equal(client.createEntity.callCount, 3);
    });

    it('should call `client.createEntity` with the correct payload', async () => {
      const target = JSON.stringify(Object.assign(
        Object.assign({}, defaultPayload),
        { class_assertions: ['0x0000', '0x0000'] }
      ));
      assert.equal(JSON.stringify(callArg), target);
    });

    it('should return an `Entity` instance', async () => {
      assert.equal(result instanceof testObj, true);
      assert.equal(result.client instanceof Client, true);
      assert.equal(result.payload instanceof Object, true);
      assert.equal(typeof result.cid, 'string');
    });

    context('without custom defaults', () => {

      beforeEach(async () => {
        result = await testObj.create();
        callArg = client.createEntity.lastCall.arg;
      });

      it ('should use base defaults', async () => {
        const target = JSON.stringify(defaultPayload);
        assert.equal(JSON.stringify(callArg), target);
      })

    });

    context('with wrong params', () => {

      beforeEach(async () => {
        result = await testObj.create({doesNotExist: '123'});
        callArg = client.createEntity.lastCall.arg;
      });

      it('should use base defaults', async () => {
        const target = JSON.stringify(defaultPayload);
        assert.equal(JSON.stringify(callArg), target);
      });

    });

  });

  describe('static .find', () => {

    const payload = {
      httpConnectionClass: true,
      httpEntityHeaderClass: true
    };
    let instance;
    let result;
    let callArg;

    beforeEach(async () => {
      instance = await testObj.create();
      result = await instance.assert(payload);
      callArg = client.createEntity.lastCall.arg;
    });

    context('with CID', () => {

      beforeEach(async () => {
        result = await testObj.find('0xabc');
      });

      it('should call `client.findEntityByCID` to find the `Entity`', async () => {
        assert.equal(client.findEntityByCID.callCount, 1);
      });

      it('should return the correct `Entity` instance', async () => {
        assert.equal(result instanceof client.Rlay_DataProperty, true);
        assert.equal(result.client instanceof Client, true);
        assert.equal(result.payload instanceof Object, true);
        assert.equal(typeof result.cid, 'string');
      });

      it('works', async () => {
        //result = await client.findEntityByCypher('MATCH (n:RlayEntity) RETURN n.cid LIMIT 200');
      });

    });

  });

  describe('.assert', () => {

    const payload = {
      httpConnectionClass: true,
      httpEntityHeaderClass: true
    };
    let instance;
    let result;
    let callArg;

    beforeEach(async () => {
      instance = await testObj.create();
      result = await instance.assert(payload);
      callArg = client.createEntity.lastCall.arg;
    });

    it('should call `client.createEntity` to create the `Assertion`(s)', async () => {
      assert.equal(client.createEntity.callCount, 3);
    });

    it('have `Individual.cid` as `subject` for `Assertion`(s)', async () => {
      assert.equal(callArg.subject, instance.cid);
    });

  });

  describe('.fetch', () => {

    beforeEach(async () => {
      result = await testObj.find(
        '0x019680031b20db6129844ab16f3eef12d155d910ac204849e984c7770ced6daf60d35bcc5e40'
      );
    });

    it('does', async () => {
      //console.log(client.schema);
      await result.fetch();
      delete result.client;
      console.log(result.type);
      const dpa = result.annotations[0];
      await dpa.fetch();
      delete dpa.client;
      const dp = dpa.property;
      await dp.fetch();
      delete dp.client;
      const a1 = dp.annotations[0];
      const a2 = dp.annotations[1];
      await Promise.all([a1.fetch(), a2.fetch()]);
      delete a1.client;
      delete a2.client;
      console.log(a1);
      console.log(a2);
    });
  });

});
