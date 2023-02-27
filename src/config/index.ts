import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'e2e' ? '.env.e2e' : '.env',
});

export const config = {
  env: process.env.NODE_ENV ?? 'dev',
  port: process.env.PORT ?? 3000,
  jwtSecret: process.env.JWT_SECRET,
  dbURI: process.env.DB_URI ?? '',
  urlBase: process.env.URL_BASE,
  mqttHost: process.env.MQTT_HOST,
  mqttPort: process.env.MQTT_PORT,
  mqttUser: process.env.MQTT_USER,
  mqttPassword: process.env.MQTT_PASSWORD,
};
