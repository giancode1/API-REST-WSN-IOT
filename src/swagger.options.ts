import { config } from './config/config';

const URL = config.urlBase ?? 'http://localhost:3000';

export const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST WSN IoT',
      version: '1.1.0',
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
