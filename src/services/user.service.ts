import boom from '@hapi/boom';
import User, { IUser } from '../libs/models/user.model';
import bcrypt from 'bcrypt';

class UserService {
  async find(): Promise<IUser[]> {
    const users = await User.find().select('-password');
    if (!users) throw boom.notFound('No users found');
    return users;
  }

  async create(data: IUser): Promise<Omit<IUser, 'password'>> {
    const userExists = await User.findOne({ email: data.email });
    if (userExists) throw boom.badRequest('User already exists');

    const hash = await bcrypt.hash(data.password, 10);

    const user = {
      ...data,
      password: hash,
    };
    const newUser = await User.create(user);

    const { password: _password, ...userWithoutPassword } = newUser.toObject();
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
    if (data.password) {
      const hash = await bcrypt.hash(data.password, 10);
      data = {
        ...data,
        password: hash,
      };
    }
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
