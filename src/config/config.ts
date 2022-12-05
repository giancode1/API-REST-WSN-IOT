import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ?? 3000,
  cors: process.env.CORS,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT ?? 27017,
  jwtSecret: process.env.JWT_SECRET,
  dbURI: process.env.DB_URI,
  urlBase: process.env.URL_BASE,
};
