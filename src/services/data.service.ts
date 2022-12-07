import Sensor from '../libs/models/sensor.model';
import Data from '../libs/models/data.model';
import boom from '@hapi/boom';
interface Options {
  sensorId: string;
  createdAt?: { $gte: string | Date };
}
class DataService {
  async getDataBySensorId(
    sensorId: string,
    limit: number,
    offset: number,
    date: string
  ) {
    let myDate;

    const options: Options = {
      sensorId,
    };

    if (date) {
      try {
        myDate = new Date(date);
        if (myDate.toString() === 'Invalid Date') {
          throw boom.badRequest('Invalid Date');
        }
        options.createdAt = { $gte: myDate };
      } catch (error) {
        throw boom.badRequest('Invalid date format');
      }
    }

    const data = await Data.find(options)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(offset);

    if (!data) throw boom.notFound('Data not found');
    return data;
  }

  async createDataBySensorId(sensorId: string, data: any) {
    const sensor = await Sensor.findById(sensorId);
    if (!sensor) throw boom.notFound('Sensor not found');
    data.sensorId = sensorId;
    const newData = new Data(data);
    return await newData.save();
  }

  async deleteManyBySensorId(sensorId: string, limit: number) {
    const data = await Data.deleteMany({ sensorId }).limit(limit);

    if (!data) throw boom.notFound('Data not found');
    return data;
  }

  async deleteDataById(id: string) {
    const data = await Data.findByIdAndDelete(id);
    if (!data) throw boom.notFound('Data not found');
    return data;
  }
}

export default DataService;
