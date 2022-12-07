import { Schema, model, Types } from 'mongoose';

export interface ISensor {
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
    id: false,
  }
);

export default model<ISensor>('Sensor', SensorSchema);
