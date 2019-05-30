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

`rlay-generate` takes two inputs, (1) the output of `rlay-seed` stored as a `.json` and (2) the path to the schema folder that stores the *schema `.js` files*, and generates a `.js` file that exports the instantiated custom rlay client.

The input and output information can be controlled via the following options:

- **`--seeded-schema`**: The location `rlay-generate` looks for the seeded `.json`. Default: `./build/schema/seed.json`
- **`--schema-dir`**: The directory `rlay-generate` looks for the schema `.js` files. Default: `./schema`
- **`--client-path`**: The location `rlay-generate` writes the generated rlay client file to. Default: `./generated/rlay-client/index.js`

#### Schema file

A *schema `.js` file`* is a `.js` file that exports the following interface:

```
{ classes: [Function], dataProperties: [Function], objectProperties: [Function] }
```

Where `Function` returns an Object with payloads like such `{ payloadId1: { payload1 }, payloadId2: { payload2 } }`. Note that the payload keys like `payloadId1` must not contain symbols that are prohibited in JS func names e.g. `/`, etc.

### `rlay-sync-redis-search`
