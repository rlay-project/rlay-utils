const path = require('path');
const winston = require('winston');

const logger = (caller) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.label({ label: path.basename(caller).split('.').shift() }),
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(
        info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)
    ),
    transports: [new winston.transports.Console()],
    colorize: true,
  });
}

module.exports = logger;
