// Conexion:
import mongoose from 'mongoose';
import { config } from '../config/config';
// local
// const URI = 'mongodb://localhost:27017/iot';

const URI = config.dbURI!;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
mongoose.connect(URI, {
  // useNewUrlParser: true, //<-- no longer necessary  documentation
  // useUnifiedTopology: true,    //<-- no longer necessary  documentation
  // useFindAndModify: false,
});

const db = mongoose.connection;

db.once('open', function () {
  console.log('[db] Conectada con éxito');
});

db.on('error', err => {
  console.log('[db] Error de conexión', err);
});

export default db;
