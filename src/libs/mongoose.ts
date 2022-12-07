// Conexion:
import mongoose from 'mongoose';
import { config } from '../config';

const URI = config.dbURI!;

const mongoConn = mongoose.connect(URI, {
  // useNewUrlParser: true,       //<-- no longer necessary  documentation
  // useUnifiedTopology: true,    //<-- no longer necessary  documentation
});

const db = mongoose.connection;

db.on('connected', () => {
  console.log('[db] Conectada con éxito');
});
db.on('error', (error: any) => {
  console.log('[db] Error de conexión', error);
});

export default db;
