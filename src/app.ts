import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Swagger Documentación
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { options } from './swagger.options';

import routerApi from './routes';

import {
  logErrors,
  errorHandler,
  boomErrorHandler,
} from './middlewares/error.handler';
import { connectDB } from './libs/mongoose';
import { httpLogger } from './middlewares/httpLogger.handler';

import './finalMqtt';

const createApp = () => {
  const app = express();

  void connectDB();

  // middlewares
  app.use(helmet());
  app.use(httpLogger);
  app.use(express.json());

  app.use(cors());
  require('./auth');

  const specs = swaggerJsDoc(options);

  app.get('/', (_req: Request, res: Response) => {
    res.send(`
    <div>
        <h1>API REST PARA LA TRANSMISIÓN DE INFORMACIÓN Y CONTROL DE REDES DE SENSORES IOT</h1>
        <h4>Autor: Ing. Giancarlo Culcay</h4>
        <form action="/docs">
         <button type="submit">Ver documentación</button>
        </form>
      </div>
      `);
  });

  routerApi(app);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

  app.use(logErrors);
  app.use(boomErrorHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
