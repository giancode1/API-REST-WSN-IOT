import '../libs/mongoose'; // conexion
import boom from '@hapi/boom';
import Sensor from '../libs/models/sensor.model';
import Data from '../libs/models/data.model';

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
    // console.log(limit, offset);

    // $gte = greater than or equal to
    // const data = await Data.find({createdAt: '2022-01-11T21:01:07.146Z'});
    let myDate;

    const options: Options = {
      sensorId,
    };

    console.log('date', date);

    if (date) {
      try {
        myDate = new Date(date);
        console.log('llego aca parece', date, myDate);
        if (myDate.toString() === 'Invalid Date') {
          throw new Error('Invalid Date');
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

    if (!data) {
      throw boom.notFound('data not found');
    }
    return data;
  }

  async createDataBySensorId(sensorId: string, data: any) {
    const sensor = await Sensor.findById(sensorId);
    if (!sensor) {
      throw boom.notFound('sensor not found'); // lanza el error
    }
    data.sensorId = sensorId;
    const newData = new Data(data);
    return await newData.save();
  }

  // el delete debe tener queries de donde hacia donde y no solo uno es especifico, osea como deleteMANY --con fechas //esta vez no le hare con fechas sino con limit

  async deleteManyBySensorId(sensorId: string, limit: number) {
    // const data = await Data.findByIdAndDelete(sensorId);

    // const data = await Data.deleteMany({sensorId: sensorId}); //borra todos los datos de un sensor
    const data = await Data.deleteMany({ sensorId: sensorId }).limit(limit); // borra los datos(#limit) mas viejos //por ejem los 2 ultimos mas antiguos borra

    if (!data) {
      throw boom.notFound('data not found');
    }
    return data;
  }

  async deleteDataById(id: string) {
    const data = await Data.findByIdAndDelete(id);
    if (!data) {
      throw boom.notFound('data not found');
    }
    return data;
  }
}

export default DataService;
// data
