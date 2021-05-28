const winston = require("winston");
const dayjs = require("dayjs");
const format = winston.format;

let logger = console;

const myFormat = format.printf(({ timestamp, level, message, meta }) => {
  return `${level}: ${timestamp} ${message}`;
});

logger = winston.createLogger({
  format: format.combine(
    format.timestamp({
      format: "MM-DD HH:mm:ss",
    }),
    format.splat(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `.logs/${dayjs().format("DDMM.HHmm")}.log`,
    }),
  ],
});

module.exports = logger;
