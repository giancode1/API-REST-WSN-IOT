import mqtt from 'mqtt';
import './libs/mongoose'; // conexion
import Data from './libs/models/data.model';

const mqttClient = mqtt.connect(
  `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`,
  { username: process.env.MQTT_USER, password: process.env.MQTT_PASSWORD }
);
// mqttClient.subscribe('/+/data');

// suscribirse a un array de topicos
mqttClient.subscribe(['/+/data', '/+/config']);

mqttClient.on('message', (topic: string, message: any) => {
  console.log('topic:', topic);
  console.log('message:', message.toString());

  const sensorId = topic.split('/')[1];
  const operation = topic.split('/')[2];

  if (operation === 'data') {
    try {
      const m = JSON.parse(message.toString()); //m es un objeto

      async function createData(payload: any) {
        payload.sensorId = sensorId; //ejm: payload.sensorId = '6195460174d18fcbab518e1a'
        const newData = new Data(payload);
        return await newData.save();
      }
      createData(m).then(console.log);
    } catch (e) {
      mqttClient.publish(`/data/error`, `{"error": "${topic}"`); //talvez fallo el formato de envio del mensaje
      console.log(`error: ${topic}`);
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

module.exports = publishChanges;
