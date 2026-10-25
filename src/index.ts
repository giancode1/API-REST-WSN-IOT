import createApp from './app';
import { config } from './config';
import logger from './utils/logger';
import { disconnectDB } from './libs/mongoose';
import { disconnectMqtt } from './finalMqtt';

const port = config.port;

const app = createApp();

const server = app.listen(port, () => {
  logger.info(`Server listening on port: ${port}`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close();
  disconnectMqtt();
  await disconnectDB();
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

// Giancarlo Culcay
