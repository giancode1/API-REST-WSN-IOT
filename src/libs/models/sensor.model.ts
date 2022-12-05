import { Schema, model, Document, Types } from 'mongoose';

export interface ISensor extends Document {
  name: string;
  description?: string;
  enabled?: boolean;
  nodeId: string | Types.ObjectId;
}

const SensorSchema = new Schema<ISensor>(
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
    nodeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Node',
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
    id: false, // para que no repita otra vez el id en la consulta
  }
);

export default model<ISensor>('Sensor', SensorSchema);
