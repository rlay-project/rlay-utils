const RlayEntities = require('./rlay');
const { ClientBase, Config } = require('./client');

class Client extends ClientBase {
  /**
   * Create a new Client instance
   *
   * @param {Config} config - The configuration for the client
   */
  constructor (config = {}) {
    super(config);
    this.initRlayEntities();
  }

  initRlayEntities () {
    // set client for RlayEntities
    Object.keys(RlayEntities).forEach(entity => {
      RlayEntities[entity].client = this;
    });
    Object.assign(this, RlayEntities);
    this.Individual = this.Rlay_Individual;
  }
}

module.exports = { Client, Config };
