import User, { IUser } from '../../src/libs/models/user.model';
import Node, { INode } from '../../src/libs/models/node.model';
import Sensor from '../../src/libs/models/sensor.model';
import Data from '../../src/libs/models/data.model';
import logger from '../../src/utils/logger';
import brcypt from 'bcrypt';
import { config } from '../../src/config';
import { connectDB } from '../../src/libs/mongoose';

export const userRoleAdmin: IUser = {
  name: 'Usuario Admin',
  email: 'admin@email.com',
  password: brcypt.hashSync('ADPa1ssS13%@', 10),
  role: 'admin',
};

export const userRoleUser: IUser = {
  name: 'Usuario X',
  email: 'usuariox@email.com',
  password: brcypt.hashSync('ADPa1ssS13%@x', 10),
  role: 'user',
};

export const upSeed = async () => {
  try {
    await connectDB();

    const users: IUser[] = [userRoleAdmin, userRoleUser];

    const usersSaved = await User.create(users);

    const nodes: INode[] = [
      {
        name: 'Nodo 1',
        description:
          'Nodo de una Raspberry pi, arduino uno, lcd, sensor de temperatura y leds indicadores',
        userId: usersSaved[0]._id,
      },
      {
        name: 'Nodo 2',
        description: 'Nodo de un sensor de humedad y temperatura y un actuador',
        userId: usersSaved[0]._id,
      },
      {
        name: 'Nodo 3',
        description:
          'Nodo de un ESP32 con un sensor de humedad y temperatura: DHT11 y 2 sensores de temperatura:lm35',
        userId: usersSaved[1]._id,
      },
    ];

    const nodesSaved = await Node.create(nodes);

    const sensors = [
      {
        name: 'Temperatura 1',
        sector: 'Parque Centro',
        resolution: 1024,
        time_ms: 6000,
        nodeId: nodesSaved[0]._id,
      },
      {
        name: 'Sensor de temperatura  y humedad',
        description: 'DHT11',
        location: 'invernadero',
        nodeId: nodesSaved[1]._id,
      },
      {
        name: 'Sensores',
        nodeId: nodesSaved[2]._id,
      },
    ];

    const sensorsSaved = await Sensor.create(sensors);

    const data = [
      {
        temperatura: 21.8,
        sensorId: sensorsSaved[0]._id,
      },
      {
        temperatura: 20.5,
        sensorId: sensorsSaved[0]._id,
      },
      {
        temperatura: 20.9,
        sensorId: sensorsSaved[0]._id,
      },
      {
        temperatura: 21.75,
        sensorId: sensorsSaved[0]._id,
      },
      {
        temperatura: 22,
        sensorId: sensorsSaved[0]._id,
      },
      {
        temperatura: 22.8,
        humedad: 43,
        sensorId: sensorsSaved[1]._id,
      },
      {
        temperatura: 22.9,
        humedad: 42,
        sensorId: sensorsSaved[1]._id,
      },
      {
        temperatura: 23.2,
        humedad: 45,
        sensorId: sensorsSaved[1]._id,
      },
      {
        temperatura: 22.7,
        humedad: 48,
        sensorId: sensorsSaved[1]._id,
      },
      {
        dht_temperatura: 22.2,
        dht_humedad: 65,
        temperatura1: 19.2345,
        temperatura2: 17.67521,
        temperatura3: 17.79731,
        sensorId: sensorsSaved[2]._id,
      },
      {
        dht_temperatura: 21.1,
        dht_humedad: 69,
        temperatura1: 18.65678,
        temperatura2: 16.65678,
        temperatura3: 16.79731,
        sensorId: sensorsSaved[2]._id,
      },
      {
        dht_temperatura: 20.3,
        dht_humedad: 61,
        temperatura1: 18.60788,
        temperatura2: 16.712,
        temperatura3: 16.8345,
        sensorId: sensorsSaved[2]._id,
      },
      {
        dht_temperatura: 20.5,
        dht_humedad: 62,
        temperatura1: 18.62881,
        temperatura2: 16.67521,
        temperatura3: 16.79731,
        sensorId: sensorsSaved[2]._id,
      },
      {
        dht_temperatura: 20.4,
        dht_humedad: 63,
        temperatura1: 18.50672,
        temperatura2: 16.67521,
        temperatura3: 16.67521,
        sensorId: sensorsSaved[2]._id,
      },
    ];

    await Data.create(data);
  } catch (error) {
    logger.error(error);
  }
};

export const downSeed = async () => {
  try {
    if (config.env === 'e2e' || config.env === 'test' || config.env === 'ci') {
      await connectDB();
      await User.deleteMany({});
      await Node.deleteMany({});
      await Sensor.deleteMany({});
      await Data.deleteMany({});
      logger.info('All data has been erased');
    }
  } catch (error) {
    logger.error(error);
  }
};
// void upSeed();
// void downSeed();
