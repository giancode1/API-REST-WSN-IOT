import boom from '@hapi/boom';
import Sensor, { ISensor } from '../libs/models/sensor.model';

class SensorService {
  async find(): Promise<ISensor[]> {
    const sensors = await Sensor.find();
    if (!sensors) throw boom.notFound('No sensors found');
    return sensors;
  }

  async create(data: ISensor): Promise<ISensor> {
    const newSensor = new Sensor(data);
    return await newSensor.save();
  }

  async findById(id: string): Promise<ISensor> {
    const sensor = await Sensor.findById(id)
      // .populate('nodeId', 'name description userId')
      .populate({
        path: 'nodeId',
        select: 'name description userId',
        populate: { path: 'userId', select: 'name' },
      });
    if (!sensor) throw boom.notFound('Sensor not found');
    return sensor;
  }

  async update(id: string, data: ISensor): Promise<ISensor> {
    const sensor = await Sensor.findByIdAndUpdate(id, data);
    if (!sensor) throw boom.notFound('Sensor not found');
    return sensor;
  }

  async delete(id: string): Promise<ISensor> {
    const sensor = await Sensor.findByIdAndDelete(id);
    if (!sensor) throw boom.notFound('Sensor not found');
    return sensor;
  }
}

export default SensorService;
