import '../libs/mongoose'; // conexion
import boom from '@hapi/boom';
import Sensor from '../libs/models/sensor.model';

class SensorService {
  async find() {
    const sensors = await Sensor.find();
    return sensors;
  }

  async create(data: string) {
    const newSensor = new Sensor(data);
    return await newSensor.save();
  }

  async findById(id: string) {
    const sensor = await Sensor.findById(id)
      // .populate('nodeId', 'name description userId')
      .populate({
        path: 'nodeId',
        select: 'name description userId',
        populate: { path: 'userId', select: 'name' },
      });
    if (!sensor) {
      throw boom.notFound('sensor not found');
    }
    return sensor;
  }

  async update(id: string, changes: any) {
    const sensor = await Sensor.findByIdAndUpdate(id, changes);
    console.log('GC SENSOR:', sensor);
    if (!sensor) {
      throw boom.notFound('sensor not found');
    }
    return sensor;
  }

  async delete(id: string) {
    const sensor = await Sensor.findByIdAndDelete(id);
    if (!sensor) {
      throw boom.notFound('sensor not found');
    }
    return sensor;
  }
}

export default SensorService;
