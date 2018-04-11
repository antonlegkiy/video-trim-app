const winston = require('winston');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const tsFormat = () => (new Date()).toLocaleTimeString();
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function getLogger(module) {
  const path = module.filename.split('/').slice(-2).join('/');

  return new winston.Logger({
    transports : [
      new winston.transports.Console({
        colorize: true,
        level: 'debug',
        label: path,
        timestamp: tsFormat
      }),
      new winston.transports.File({
        filename: `${logDir}/results.log`,
        timestamp: tsFormat,
        level: env === 'development' ? 'debug' : 'info'
      })
    ]
  });
}

module.exports = getLogger;
