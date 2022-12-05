import '../libs/mongoose'; // conexion
import boom from '@hapi/boom';
import User from '../libs/models/user.model';
import brcypt from 'bcrypt';

class UserService {
  async find() {
    // Promise<IUser[]> | User[]   podria ser
    const users = await User.find().select('-password');
    return users;
  }

  async create(data: any) {
    const user = await User.findOne({ email: data.email });
    if (user) {
      throw boom.badRequest('User already Exists');
    }

    const hash = brcypt.hashSync(data.password, 10);
    const newUser: any = new User({
      ...data,
      password: hash,
    });
    await newUser.save();

    const { password, ...userWithoutPass } = newUser._doc;

    return userWithoutPass;
  }

  async findById(id: string) {
    const user = await User.findById(id)
      .select('-password')

      .populate({
        path: 'nodes',
        select: 'name -userId',
        populate: { path: 'sensors', select: 'name -nodeId' },
      });

    if (!user) {
      throw boom.notFound('user not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw boom.notFound('user not found');
    }
    return user;
  }

  async update(id: string, changes: any) {
    const user = await User.findByIdAndUpdate(id, changes).select('-password');
    if (!user) {
      throw boom.notFound('user not found');
    }
    return user;
  }

  async delete(id: string) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw boom.notFound('user not found');
    }
    return user;
  }
}

export default UserService;
