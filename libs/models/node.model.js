const { Schema, model } = require('mongoose');

const NodeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    userId:{
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
  },
  {
    versionKey: false,
    timestamps: true, //crea createdAt y updatedAt
    strict: false,
    id: false       //para que no repita otra vez el id en la consulta
  }
);

NodeSchema.virtual('sensors', {
  ref: 'Sensor',
  localField: '_id',
  foreignField: 'nodeId',
})

NodeSchema.set('toObject', { virtuals: true });
NodeSchema.set('toJSON', { virtuals: true });

module.exports = model('Node', NodeSchema);
