import { Schema, model, Document, Types } from 'mongoose';

export interface IData extends Document {
  sensorId: string | Types.ObjectId;
}

const DataSchema = new Schema<IData>(
  {
    sensorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Sensor',
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

export default model<IData>('Data', DataSchema);
