require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  cors: process.env.CORS,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  jwtSecret: process.env.JWT_SECRET
};
if (process.env.DB === 'azure') {
  config.URI = `mongodb://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@${config.dbName}@`;
}else if (process.env.DB === 'atlas') {
  config.URI = process.env.DB_ATLAS;
}
module.exports = { config };
