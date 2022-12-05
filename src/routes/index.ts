import express, { Application } from 'express';

import usersRouter from './users.router';
import nodesRouter from './nodes.router';
import sensorsRouter from './sensors.router';
import dataRouter from './data.router';
import authRouter from './auth.router';

function routerApi(app: Application) {
  const router = express.Router();

  app.use('/api/v1', router);
  router.use('/users', usersRouter);
  router.use('/nodes', nodesRouter);
  router.use('/sensors', sensorsRouter);
  router.use('/data', dataRouter); // solo tendra delete
  router.use('/auth', authRouter);
}

export default routerApi;
