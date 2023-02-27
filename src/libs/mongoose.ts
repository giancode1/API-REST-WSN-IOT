import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../utils/logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.dbURI, {
      // useNewUrlParser: true, // <-- no longer necessary  documentation
      // useUnifiedTopology: true,    //<-- no longer necessary  documentation
    });
    mongoose.set('strictQuery', false);
    logger.info('[db] Successfully Connected');
  } catch (error) {
    logger.error('[db] Connection Error', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('[db] Disconnected');
  } catch (error) {
    logger.error('[db] Error disconnecting:', error);
    process.exit(1);
  }
};
