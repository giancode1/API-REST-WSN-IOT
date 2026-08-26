import { config } from './config';

// require en vez de import: evita que tsc emita package.json dentro de dist
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require('../package.json') as { version: string };

const URL = config.urlBase ?? `http://localhost:${config.port}`;

export const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST WSN IoT',
      version,
      description: `API REST PARA LA TRANSMISIÓN DE INFORMACIÓN Y CONTROL DE REDES DE SENSORES IOT`,
      contact: {
        name: 'Giancarlo Culcay',
        email: 'gianculcay@gmail.com',
      },
    },
    servers: [
      {
        url: `${URL}/api/v1`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};
