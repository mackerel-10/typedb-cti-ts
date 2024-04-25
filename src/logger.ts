import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf } = winston.format;
const logDir = `${process.cwd()}/logs`;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    label({ label: 'MITRE ATT&CK Migrator' }),
    logFormat,
  ),
  defaultMeta: { service: 'MITRE-ATT&CK-migrator' },
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      level: 'info',
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      maxFiles: 30,
    }),
    new DailyRotateFile({
      level: 'error',
      filename: '%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',
      maxFiles: 30,
    }),
  ],
});

export default logger;
