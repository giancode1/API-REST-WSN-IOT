require('../libs/mongoose'); //conexion
const boom = require('@hapi/boom');
const Sensor = require('../libs/models/sensor.model');
const Data = require('../libs/models/data.model');

class DataService {
  constructor() {

  }

  async getDataBySensorId(sensorId, limit, offset, date) {
    let myDate

    const options = {
      sensorId: sensorId,
    }
    if(date){
      try {
        myDate = new Date(date);
        if(myDate.toString() === 'Invalid Date'){
          throw new Error('date is not a valid date');
        }
        options.createdAt = {$gte: myDate}
      } catch (error) {
        throw boom.badRequest('Invalid date format');
      }
    }

    const data = await Data.find(options).sort({_id:-1}).limit(limit).skip(offset);


    if(!data){
      throw boom.notFound('data not found');
    }
    return data;
  }

  async createDataBySensorId(sensorId, data) {
    const sensor = await Sensor.findById(sensorId)
    if(!sensor){
      throw boom.notFound('sensor not found');  
    }
    data.sensorId = sensorId;
    const newData = await Data(data);
    return await newData.save();
  }

  // async update(sensorId, changes) {
  //   const data = await Data.findByIdAndUpdate(sensorId, changes);
  //   if(!data){
  //     throw boom.notFound('data not found');  
  //   }
  //   return data;
  // }

  async deleteManyBySensorId(sensorId, limit) {
    const data = await Data.deleteMany({sensorId: sensorId}).limit(limit);
    if(!data){
      throw boom.notFound('data not found');  
    }
    return data;
  }

  async deleteDataById(id) {
    const data = await Data.findByIdAndDelete(id);
    if(!data){
      throw boom.notFound('data not found');  
    }
    return data;
  }
}

module.exports = DataService;

