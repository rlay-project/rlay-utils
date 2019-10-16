export interface IClientConfig {
  address? : string
  backend? : string
  RpcUrl?: string
  storeLimit?: number
  readLimit?: number
}

export class ClientConfig implements IClientConfig {
  address: string = '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13';
  backend: string = 'myneo4j';
  RpcUrl: string = process.env.RPC_URL || 'http://localhost:8546';
  storeLimit: number = 50;
  readLimit: number = 50;

  constructor() {
    Object.seal(this);
  }
}
