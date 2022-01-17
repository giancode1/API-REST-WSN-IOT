const { Schema, model } = require('mongoose');

const SensorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    nodeId:{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Node'
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
    id: false       
  }
);

module.exports = model('Sensor', SensorSchema);
