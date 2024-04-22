import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf } = winston.format;
const logDir = `${process.cwd()}/logs`;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    label({ label: 'MITRE ATT&CK Migrator' }),
    logFormat,
  ),
  defaultMeta: { service: 'MITRE-ATT&CK-migrator' },
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
    }),
  ],
});

export default logger;
