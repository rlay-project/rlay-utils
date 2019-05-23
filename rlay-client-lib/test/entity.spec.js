/* eslint-env node, mocha */
const assert = require('assert');
const { Entity, EntityInterface, EntityFactoryInterface } = require('../src/entity');

describe('Entity', () => {
  it('inherits from `EntityInterface`', () => {
    assert.equal(Entity.prototype instanceof EntityInterface, true);
  });

  it('inherits from `EntityFactoryInterface`', () => {
    assert.equal(Entity.prototype instanceof EntityFactoryInterface, true);
  });
});
