class ClientConfig {
  constructor() {
    this.address = '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13';
    this.backend = 'myneo4j';
    this.RpcUrl = process.env.RPC_URL || 'http://localhost:8546';
    this.storeLimit = 50;
    this.readLimit = 50;
    this.kafka = undefined;
    Object.seal(this);
  }
}

module.exports = { ClientConfig };
