# Rlay Utils

Provides a helpful CLI interface for common tasks such as seeding the schema and generating the application rlay-client ORM.

See here for the [documentation for the Rlay Client Library](./rlay-client-lib).

## Install

```
npm install --g @rlay/utils
```

## Usage

The typical flow is to first call `rlay-seed` to submit the schema and create the CIDs for the schema entities such as `Class`, `Annotation`, `DataProperty`, `ObjectProperty` and so on. Afterwards `rlay-generate` uses that output file to instantiate the custom rlay client from that schema via `rlay-client-lib`.

## Commands

Rlay Utils exposes the following commands:

### `rlay-seed`


### `rlay-dump`


### `rlay-generate`

`rlay-generate` takes two inputs, (1) the output of `rlay-seed` stored as a `.json` and (2) the path to the seed file which served as input for the `rlay-seed` command. It then generates a `.js` file as output that exports the instantiated custom rlay client with the seeded schema.

The input and output information can be controlled via the following options:

- **`--seed-file-output`**: path to the file that contains the output of the rlay-seed command. Default: `./generated/seed.json`
- **`--seed-file`**: path to the file that served as input for the rlay-seed command. Default: `./seed.js`
- **`--output`**: path to the file where the generated rlay client should be written to. Default: `./generated/rlay-client/index.js`

#### Usage

You can then `require` the generated file in your application. Example:

```javascript
const defaultClient = require('./generated/rlay-client'); // for the default client
const { getClient } = require('./generated/rlay-client'); // for configuring your own custom client

const customClient = getClient({ ...config });
// calling getClient({ ...config }) anywhere else in your code with the same config will always return the same instance.
// You can create as many custom clients as you like
```

Example of a `{ ...config }`:

```javascript
{
  address: '0xc02345a911471fd46c47c4d3c2e5c85f5ae93d13',
  backend: 'myneo4j',
  RpcUrl: 'http://localhost:8546',
  storeLimit: 50,
  readLimit: 50
}
```

### `rlay-sync-redis-search`
