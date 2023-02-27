import pino, { Logger } from 'pino';
import { config } from '../config';

let logger: Logger;

if (config.env === 'test' || config.env === 'e2e') {
  logger = pino({
    level: 'silent',
  });
} else {
  logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  });
}

export default logger;
