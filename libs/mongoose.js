//conexion:
const mongoose = require('mongoose');
const { config } = require('../config/config');

const URI = config.URI

mongoose.connect( URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', function () {
  console.log('[db] Conectada con éxito');
});

db.on('error', (err) => {
  console.log('[db] Error de conexión', err);
});

module.exports = db;
