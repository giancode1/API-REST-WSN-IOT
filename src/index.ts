import createApp from './app';
import { config } from './config';
import logger from './utils/logger';

const port = config.port;

const app = createApp();

app.listen(port, () => {
  logger.info(`Server listening on port: ${port}`);
});

// Giancarlo Culcay
