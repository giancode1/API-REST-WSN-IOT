import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../utils/logger';

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.dbURI);
    logger.info('[db] Successfully Connected');
  } catch (error) {
    logger.error(error, '[db] Connection Error');
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('[db] Disconnected');
  } catch (error) {
    logger.error(error, '[db] Error disconnecting');
  }
};
