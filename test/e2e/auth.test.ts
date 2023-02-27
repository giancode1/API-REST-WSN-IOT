import request from 'supertest';
import createApp from '../../src/app';
import { Express } from 'express';
import User from '../../src/libs/models/user.model';
import { disconnectDB } from '../../src/libs/mongoose';
import { downSeed, upSeed, userRoleAdmin, userRoleUser } from '../utils/seed';

describe('test for /auth path', () => {
  let app: Express;
  let server: any = null;
  const port = 9000;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(port);
    await upSeed();
  });

  afterAll(async () => {
    await downSeed();
    await disconnectDB();
    server.close();
  });

  describe('[POST] /login', () => {
    test('should return 404, User not found', async () => {
      const inputData = {
        email: 'userrandom@email.com',
        password: '1235678',
      };
      const { statusCode, body } = await request(app)
        .post('/api/v1/auth/login')
        .send(inputData);
      expect(statusCode).toBe(404);
      expect(body.message).toEqual('User not found');
    });

    test('should return 401, invalid email or password', async () => {
      const user = await User.findOne({ email: userRoleAdmin.email });

      if (!user)
        throw new Error(`user: ${userRoleAdmin.email} , not found in [db]`);

      const inputData = {
        email: user.email,
        password: 'ADPa1ssS13%', // invalid password
      };
      const { statusCode, body } = await request(app)
        .post('/api/v1/auth/login')
        .send(inputData);
      expect(statusCode).toBe(401);
      expect(body.message).toBe('invalid email or password');
    });

    test('should return 200, admin', async () => {
      const user = await User.findOne({ email: userRoleAdmin.email });

      if (!user)
        throw new Error(`user: ${userRoleAdmin.email} , not found in [db]`);

      const inputData = {
        email: user.email,
        password: 'ADPa1ssS13%@',
      };

      const { statusCode, body } = await request(app)
        .post('/api/v1/auth/login')
        .send(inputData);

      expect(statusCode).toBe(200);
      expect(body.token).toBeTruthy();
      expect(body.user.email).toEqual(user.email);
      expect(body.user.role).toBe(user.role);
      expect(body.user.password).toBeUndefined();
    });

    test('should return 200, user x', async () => {
      const user = await User.findOne({ email: userRoleUser.email });

      if (!user)
        throw new Error(`user: ${userRoleAdmin.email} , not found in [db]`);

      const inputData = {
        email: user.email,
        password: 'ADPa1ssS13%@x',
      };
      const { statusCode, body } = await request(app)
        .post('/api/v1/auth/login')
        .send(inputData);
      expect(statusCode).toBe(200);
      expect(body.token).toBeTruthy();
      expect(body.user.email).toEqual(user.email);
      expect(body.user.role).toBe(user.role);
      expect(body.user.password).toBeUndefined();
    });
  });
});
