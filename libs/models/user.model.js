const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
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
      default: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true, 
    id: false       //para que no repita otra vez el id en la consulta
  }
);


UserSchema.virtual('nodes', {
  ref: 'Node',
  localField: '_id',
  foreignField: 'userId',
})

UserSchema.set('toObject', { virtuals: true }); // So `console.log()` and other functions that use `toObject()` include virtuals
UserSchema.set('toJSON', { virtuals: true }); // So `res.json()` and other `JSON.stringify()` functions include virtuals

module.exports = model('User', UserSchema); 
