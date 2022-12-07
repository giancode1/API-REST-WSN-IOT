import { Schema, model } from 'mongoose';

// import bcrypt from 'bcrypt';
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
      // select: false,
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

// otro ---
// UserSchema.pre<IUser>('save', async function (this: any, next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// Add a method to compare the old and new password
// UserSchema.methods.comparePassword = async function (
//   this: any,
//   candidatePassword: string
// ) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

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
