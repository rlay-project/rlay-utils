const debug = require('debug');
const rlayClientLibDebug = debug('rlayClientLib');

const logger = (caller) => {
  const newDebug = rlayClientLibDebug.extend(caller);

  return {
    debug: newDebug.extend('debug'),
    info: newDebug.extend('info'),
    warn: newDebug.extend('warn'),
    error: newDebug.extend('error'),
  };
}

module.exports = logger;
