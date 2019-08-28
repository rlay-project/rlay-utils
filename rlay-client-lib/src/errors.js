const VError = require('verror');

class UnknownEntityError extends Error {
  constructor (message) {
    super(message);
   // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
   // This clips the constructor invocation from the stack trace.
   // It's not absolutely essential, but it does make the stack trace a little nicer.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  UnknownEntityError,
  SchemaPayload: {
    invalidClient: () => {
      const wrongType = new Error(`expected client to be instance of ClientInterface`)
      const invalidClient = new VError(wrongType, 'invalid client');
      return new VError(invalidClient, 'failed to instantiate schema payload');
    },
    schemaEntityNotFound: (name) => {
      const propertyNotFound = new Error(`schema entity ${name} not found. Make sure it was seeded`)
      const invalidProperty = new VError(propertyNotFound, 'invalid payload object');
      return new VError(invalidProperty, 'failed to instantiate schema payload');
    },
    classAssertionNoArray: (name) => {
      const propertyValueInvalid = new Error(`property ${name} can not have multiple assertions and can therefore not be an array`)
      const invalidProperty = new VError(propertyValueInvalid, 'invalid payload input');
      return new VError(invalidProperty, 'failed to create schema payload assertions');
    }
  }
};
