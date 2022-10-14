require('../libs/mongoose'); //conexion
const boom = require('@hapi/boom');
const Sensor= require('../libs/models/sensor.model');
const publishChanges = require('../finalMqtt')

class SensorService {
  constructor() {

  }
  async find() {
    const sensors = await Sensor.find()
    return sensors;
  }

  async create(data) {
    const newSensor = await Sensor(data);
    return await newSensor.save();
  }

  async findById(id) {
    const sensor = await Sensor.findById(id)
    .populate({
      path: 'nodeId',
      select: 'name description userId',
      populate: { path: 'userId', select: 'name' }
    })
    if(!sensor){
      throw boom.notFound('sensor not found');  
    }
    return sensor;
  }

  async update(id, changes) {
    console.log(changes)
    const sensor = await Sensor.findByIdAndUpdate(id, changes);
    // console.log("GC SENSOR:", sensor);
    sensor && await publishChanges(id, changes);
    if(!sensor){
      throw boom.notFound('sensor not found');  
    }
    return sensor;
  }

  async delete(id) {
    const sensor = await Sensor.findByIdAndDelete(id);
    if(!sensor){
      throw boom.notFound('sensor not found');  
    }
    return sensor;
  }
}

module.exports = SensorService;
