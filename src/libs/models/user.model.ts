import { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  enabled?: boolean;
  role?: 'user' | 'admin';
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 5,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
    id: false, // para que no repita otra vez el id en la consulta
  }
);

UserSchema.virtual('nodes', {
  ref: 'Node',
  localField: '_id',
  foreignField: 'userId',
});

UserSchema.set('toObject', { virtuals: true }); // So `console.log()` and other functions that use `toObject()` include virtuals
UserSchema.set('toJSON', { virtuals: true }); // So `res.json()` and other `JSON.stringify()` functions include virtuals

export default model<IUser>('User', UserSchema); // mongoose guarda la coleccion como users
