const express = require('express');

const usersRouter = require('./users.router');
const nodesRouter = require('./nodes.router');
const sensorsRouter = require('./sensors.router');
const dataRouter = require('./data.router');
const authRouter = require('./auth.router');

function routerApi(app){
  const router = express.Router()

  app.use('/api/v1', router);
  router.use('/users', usersRouter);
  router.use('/nodes', nodesRouter);
  router.use('/sensors', sensorsRouter);
  router.use('/data', dataRouter);  //solo tendra delete
  router.use('/auth', authRouter);
}

module.exports = routerApi;
