require('../libs/mongoose'); //conexion
const boom = require('@hapi/boom');
const User = require('../libs/models/user.model');
const brcypt = require('bcrypt');

class UserService {
  constructor() {

  }
  async find() {
    const users = await User.find().select("-password")
    return users;
  }

  async create(data) {
    const hash = await brcypt.hashSync(data.password, 10); //método asincrono
    const newUser = await User({
      ...data,
      password: hash
    });
    await newUser.save();
    newUser.password = undefined;
    return newUser;
  }

  async findById(id) {
    const user = await User.findById(id)
    .select('-password')
    .populate({
      path: 'nodes',
      select: 'name -userId',
      populate: { path: 'sensors', select: 'name -nodeId' }
    })
    if(!user){
      throw boom.notFound('user not found');  
    }
    return user;
  }
  async findByEmail(email) {
    const user = await User.findOne({email:email});
    if(!user){
      throw boom.notFound('user not found');  
    }
    return user;
  }

  async update(id, changes) {
    if (changes.password){
      const hash = await brcypt.hashSync(changes.password, 10); //método asincrono
      changes.password = hash;
    }
    const user = await User.findByIdAndUpdate(id, changes).select("-password");
    if(!user){
      throw boom.notFound('user not found');  
    }
    return user;
  }

  async delete(id) {
    const user = await User.findByIdAndDelete(id);
    if(!user){
      throw boom.notFound('user not found');  
    }
    return user;
  }
}

module.exports = UserService;
