import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as winston from 'winston';

const logDirectory = 'logs';
// Create a log directory if it does not exist
if (!existsSync(logDirectory)) {
  mkdirSync(logDirectory);
}

const errorLog = join(logDirectory, 'errors.log');
const combinedLog = join(logDirectory, 'combined.log');
const exceptionsLog = join(logDirectory, 'exceptions.log');

export const loggerConfig = {
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.splat(),
    winston.format.colorize()
  ),
  transports: [
    new winston.transports.File({
      filename: errorLog,
      level: 'error'
    }),
    new winston.transports.File({
      filename: combinedLog
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: exceptionsLog
    })
  ]
};
