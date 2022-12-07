import boom from '@hapi/boom';
import User, { IUser } from '../libs/models/user.model';
import brcypt from 'bcrypt';

class UserService {
  async find(): Promise<IUser[]> {
    const users = await User.find().select('-password');
    if (!users) throw boom.notFound('No users found');
    return users;
  }

  async create(data: IUser): Promise<IUser> {
    const userExists = await User.findOne({ email: data.email });
    if (userExists) throw boom.badRequest('User already exists');

    const hash = brcypt.hashSync(data.password, 10);

    const user = {
      ...data,
      password: hash,
    };
    const newUser: any = await User.create(user);

    const { password, ...userWithoutPassword } = newUser._doc;
    return userWithoutPassword;
  }

  async findById(id: string): Promise<IUser> {
    const user = await User.findById(id)
      .select('-password')

      .populate({
        path: 'nodes',
        select: 'name -userId',
        populate: { path: 'sensors', select: 'name -nodeId' },
      });

    if (!user) throw boom.notFound('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<IUser> {
    const user = await User.findOne({ email });
    if (!user) throw boom.notFound('User not found');
    return user;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, data).select('-password'); // return old user
    if (!user) throw boom.notFound('User not found');
    return user;
  }

  async delete(id: string): Promise<IUser> {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw boom.notFound('User not found');
    return user;
  }
}

export default UserService;
