import fs from 'node:fs';
import path from 'node:path';
import { config } from './config';

// Busca package.json subiendo desde este archivo. Funciona tanto en desarrollo
// (src/swagger.options.ts -> ../package.json) como compilado
// (dist/src/swagger.options.js -> ../../package.json), sin que tsc copie
// package.json dentro de dist.
const readVersion = (): string => {
  let dir = __dirname;
  for (;;) {
    const file = path.join(dir, 'package.json');
    if (fs.existsSync(file)) {
      return (JSON.parse(fs.readFileSync(file, 'utf8')) as { version: string })
        .version;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return '0.0.0';
    dir = parent;
  }
};

const version = readVersion();

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
