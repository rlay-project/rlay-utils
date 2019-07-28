# Rlay Client Library

Provides a high-level interface (ORM) for your application, based on your schema.

This library exposes `Rlay` native `Entities` such as `Rlay_Class`, `Rlay_ClassAssertion`, `Rlay_Individual`, etc. through the client. When the client is generated and constructed with `rlay-generated`, the client will also expose the application specific `Entities` e.g. `HTTPRequestClass`, etc. These application specific `Entities` can

## Requirements

```
npm install -g @rlay/utils
```

## Usage

### `rlay-generate`

The default behavior for using the Rlay Client Library is, by using `rlay-generate`, which
creates `generated/rlay-client/index.js` in the root of the project. `generated/rlay-client/index.js` exposes the initialized `Client` instance, ready for usage.

```javascript
const client = require('./generated/rlay-client');

// Create a new Individual
client.Individual.create();

// Find an Entity by its CID
client.Individual.find('123...789');
// this also works
client.Entity.find('123...789');
```

### Instantiate a new Entity (except Individual)

Assume payload is valid and of type `DataProperty`

```js
const client = require('./generated/rlay-client');

const entity = new client.Rlay_DataProperty(client, payload);
```

or

```js
const client = require('./generated/rlay-client');

const entity = new client.Rlay_DataProperty.from(payload);
```

or (recommended)

```js
const client = require('./generated/rlay-client');

const entity = new client.getEntityFromPayload(payload);

assert(entity instanceof client.Rlay_DataProperty);
```

### Create a new Entity (except Individual)

Assume payload is valid and of type `DataProperty`

```js
const client = require('./generated/rlay-client');

const entity = new client.Rlay_DataProperty(client, payload);
await entity.create();
```

or

```js
const client = require('./generated/rlay-client');

const entity = await client.Rlay_DataProperty.create(payload);
```

or (recommended)

```js
const client = require('./generated/rlay-client');

const entity = await client.createEntityFromPayload(payload);

assert(entity instanceof client.Rlay_DataProperty);
assert.equal(entity.remoteCid, entity.cid);
```

### Create an Individual with inherent properties aka. properties

The properties of an individual can only be specified at the creation-time of the `Individual` and are like any other operations immutable.

```javascript
const client = require('./generated/rlay-client');

const properties = {
  nameOfApplicationSpecificEntity: true,
  anotherApplicationSpecificEntity: 45,
};

// Create a new Individual
client.Individual.create(properties);
```

### Create non-inherent properties aka. assertions about an Individual

Once the individual is created (with or without properties) assertions about it can be made.

```javascript
const client = require('./generated/rlay-client');

const properties = {
  nameOfApplicationSpecificEntity: true,
  anotherApplicationSpecificEntity: 45,
};

const assertions = {
  nameOfApplicationSpecificEntity: 'test',
  anotherApplicationSpecificEntity: 42,
};

// Create a new Individual
const indi = client.Individual.create(properties);
// Create assertions about that individual
indi.assert(assertions);
```

### Find an entity by its CID

Once an entity is created it can be found by its CID.

```javascript
const client = require('./generated/rlay-client');

// Find an entity
const result1 = client.Entity.find('individual_CID');
const result2 = client.Entity.find('class_CID');

console.log(result1 instanceof client.Rlay_Individual); // true
console.log(result2 instanceof client.Rlay_Class); // true
// .find() calls .fetch() on the Entity instance
console.log(result1.properties instanceof Object); // true
console.log(result1.nameOfApplicationSpecificEntity !== undefined); // true
```

## Architecture

### Rlay Entities

- [x] Entity
  - [x] documentation
  - [x] tests
- [x] Entity Factory Interface
  - [x] documentation
  - [x] tests
- [x] Entity Interface
  - [x] documentation
  - [x] tests
- [x] Individual
  - [ ] documentation
  - [ ] tests
- [ ] Integration tests

## Testing

All tests are unit tests and do not require a running rlay-client server. All tests are importing the `Rlay MockClient`.

### `Rlay MockClient`

Located at `[./test/mocks/client.js](./tests/mocks/client.js)` it mocks all functions that usually would call out to the rlay-client server.
