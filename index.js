const express = require('express');
const morgan = require('morgan');
const routerApi = require('./routes');
const cors = require('cors');

//swagger documentacion
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { options } = require('./swagger.options');

// require('./finalMqtt');

const { logErrors, errorHandler, boomErrorHandler } = require('./middlewares/error.handler');

const app = express();

const port = process.env.PORT || 3000;

//middlewares
app.use(morgan(':method -- :res[content-length] - :response-time ms'))
app.use(express.json());


app.use(cors());
require('./auth'); //para que passport funcione

const specs = swaggerJsDoc(options);

app.get('/' , (req, res) =>{
  res.send("Hola mi servidor en Express, autor: Giancarlo Culcay");
});

routerApi(app);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log("My port: " + port);
});










