const { Schema, model } = require('mongoose');

const DataSchema = new Schema(
  {
    sensorId:{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Sensor'
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false
  }
);

module.exports = model('Data', DataSchema); 
