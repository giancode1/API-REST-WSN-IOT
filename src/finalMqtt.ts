import mqtt from 'mqtt';
import './libs/mongoose'; // conexion
import Data from './libs/models/data.model';
import { config } from './config';
import logger from './utils/logger';

let attempts = 0;
const maxAttempts = 10;

const mqttClient = mqtt.connect(
  `mqtt://${config.mqttHost!}:${config.mqttPort!}`,
  { username: config.mqttUser, password: config.mqttPassword }
);

mqttClient.on('connect', () => {
  logger.info('MQTT Connected!');
});

mqttClient.on('error', error => {
  logger.warn('Error connecting to MQTT: ' + error.message);
  if (attempts < maxAttempts) {
    attempts++;
    mqttClient.reconnect();
  } else {
    logger.info(`Max Attempts reached: ${maxAttempts}`);
    mqttClient.end();
    logger.info('Maximum attempts reached. Closing connection.');
  }
});

// mqttClient.subscribe('/+/data');

// suscribirse a un array de topicos
mqttClient.subscribe(['/+/data', '/+/config']);

mqttClient.on('message', (topic: string, message: any) => {
  logger.info('topic:', topic);
  logger.info('message:', message.toString());

  const sensorId = topic.split('/')[1];
  const operation = topic.split('/')[2];

  if (operation === 'data') {
    try {
      const m = JSON.parse(message.toString()); // m es un objeto

      async function createData(payload: any) {
        payload.sensorId = sensorId; // ejm: payload.sensorId = '6195460174d18fcbab518e1a'
        const newData = new Data(payload);
        return await newData.save();
      }
      void createData(m).then(console.log);
    } catch (e) {
      mqttClient.publish(`/data/error`, `{"error": "${topic}"`); // talvez fallo el formato de envio del mensaje
      logger.info(`error: ${topic}`);
    }
  }
  // else if (operation === 'config') {
  //   const config = JSON.parse(message.toString());
  //   console.log("config:",config);
  // }
});

async function publishChanges(sensorId: string, changes: any) {
  try {
    const myconfig = JSON.stringify(changes);
    mqttClient.publish(`/${sensorId}/config`, myconfig);
  } catch (error) {
    console.log(error);
  }
}

export default publishChanges;
