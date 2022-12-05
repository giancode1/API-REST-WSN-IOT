import { Schema, model } from 'mongoose';

// const bcrypt = require('bcrypt');
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
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // select: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'user',
    },
    // nodes: [{
    //   type: Schema.Types.ObjectId,
    //   ref: 'Node'
    // }],
  },
  {
    versionKey: false,
    timestamps: true, // crea createdAt y updatedAt
    id: false, // para que no repita otra vez el id en la consulta
  }
);

// UserSchema.methods.encrypPassword = async (password) => {
//   const saltRounds = await bcrypt.genSalt(10)
//   return await bcrypt.hash(password, saltRounds)
// }

// UserSchema.methods.matchPassword = async function(password) {
//   return await bcrypt.compare(password, this.password)
// }

UserSchema.virtual('nodes', {
  ref: 'Node',
  localField: '_id',
  foreignField: 'userId',
});

// Set Object and Json property to true. Default is set to false
UserSchema.set('toObject', { virtuals: true }); // So `console.log()` and other functions that use `toObject()` include virtuals
UserSchema.set('toJSON', { virtuals: true }); // So `res.json()` and other `JSON.stringify()` functions include virtuals

export default model<IUser>('User', UserSchema); // mongoose guarda la coleccion como users
// module.exports = model<IUser>('User', UserSchema); //mongoose guarda la coleccion como users
