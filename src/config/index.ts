import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'e2e' ? '.env.e2e' : '.env',
});

const requiredEnvVars = ['JWT_SECRET', 'DB_URI'] as const;
const missing = requiredEnvVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

export const config = {
  env: process.env.NODE_ENV ?? 'dev',
  port: process.env.PORT ?? 3000,
  jwtSecret: process.env.JWT_SECRET as string,
  dbURI: process.env.DB_URI as string,
  urlBase: process.env.URL_BASE,
  mqttHost: process.env.MQTT_HOST,
  mqttPort: process.env.MQTT_PORT,
  mqttUser: process.env.MQTT_USER,
  mqttPassword: process.env.MQTT_PASSWORD,
};
