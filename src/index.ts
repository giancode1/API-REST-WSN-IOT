import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
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

import { config } from './config/config';

// comentado ya que se termino los creditos de Azure Student y se inhabilito el contenedor de mqtt:
// import './finalMqtt'; // descomentar para agregar comunicación MQTT, agregar nuevas variables
// los datos de usuarios, nodos, sensores, data  continuan funcionando

const app = express();

const port = config.port;

// middlewares
// app.use(morgan('dev'))
// app.use(morgan('tiny'))
app.use(helmet());
app.use(morgan(':method -- :res[content-length] - :response-time ms'));
app.use(express.json());
// app.use(express.urlencoded({ extended: true}))

app.use(cors());
require('./auth'); // para que passport funcione

const specs = swaggerJsDoc(options);

app.get('/', (_req: Request, res: Response) => {
  res.send(`
  <div>
      <h1>API REST PARA LA TRANSMISIÓN DE INFORMACIÓN Y CONTROL DE REDES DE SENSORES IOT</h1>
      <h4>Autor: Giancarlo Culcay</h4>
    </div>
    `);
});

routerApi(app);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// middlewares, importante el orden
app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`My port: ${port}`);
});
