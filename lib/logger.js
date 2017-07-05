import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import FileStreamRotator from 'file-stream-rotator';

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

export const fileLogger = morgan('common', { stream: accessLogStream });
export const stdoutLogger = morgan('dev');
