const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const FileStreamRotator = require('file-stream-rotator');

// Apply logger middleware
const logDirectoryName = 'logs';
const appDirectory = path.dirname(require.main.filename);
const logDirectory = path.join(appDirectory, logDirectoryName);

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
});

const fileLogger = morgan('common', { stream: accessLogStream });
const stdoutLogger = morgan('dev');

module.exports = {
  fileLogger,
  stdoutLogger
};
