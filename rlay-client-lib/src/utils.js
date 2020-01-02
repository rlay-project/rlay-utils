const check = require('check-types');
const VError = require('verror');

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const generateFnName = (string) => {
  if (string.endsWith('Class')) return capitalizeFirstLetter(string.slice(0, -5));
  if (string.endsWith('DataProperty')) return capitalizeFirstLetter(string.slice(0, -12));
  if (string.endsWith('ObjectProperty')) return capitalizeFirstLetter(string.slice(0, -14));
  return string;
}

const createDebugFnObject = () => {
  return {
    startTimestamp: Date.now()
  }
}

const wrapDebug = async (promise, debugFn) => {
  try {
    check.assert.instance(promise, Promise, 'expected input (promise) to be a promise instance');
    check.assert.instance(debugFn, Function, 'expected input (debugFn) to be a function instance');
    const debugObject = createDebugFnObject();
    return promise.then(result => {
      debugFn(debugObject);
      return result;
    });
  } catch (e) {
    throw new VError(e, 'failed to exectue wrapDebug');
  }

}

module.exports = {
  generateFnName,
  capitalizeFirstLetter,
  wrapDebug,
  createDebugFnObject
};
