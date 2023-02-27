import request from 'supertest';
import createApp from '../../src/app';
import { Express } from 'express';

import User from '../../src/libs/models/user.model';
import { disconnectDB } from '../../src/libs/mongoose';
import { upSeed, downSeed, userRoleAdmin, userRoleUser } from '../utils/seed';
import brcypt from 'bcrypt';

describe('=> Test for /users path', () => {
  let app: Express;
  let server: any = null;
  let token = '';
  let id = '';
  const port = 9000;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(port);
    await upSeed();

    const user = await User.findOne({ email: userRoleAdmin.email });
    if (!user)
      throw new Error(`user: ${userRoleAdmin.email} , not found in [db]`);

    const inputData = {
      email: userRoleAdmin.email,
      password: 'ADPa1ssS13%@',
    };
    const { body: bodyLogin } = await request(app)
      .post('/api/v1/auth/login')
      .send(inputData);

    id = user._id.toString();
    token = bodyLogin.token;
  });

  afterAll(async () => {
    token = '';
    await downSeed();
    await disconnectDB();
    server.close();
  });

  describe('[GET] /users/{id}', () => {
    test('should return 400, Bad Request - Invalid id', async () => {
      const { statusCode, body } = await request(app)
        .get(`/api/v1/users/61e457adf8gce89bf43dcbc`)
        .set({ Authorization: `Bearer ${token}` });
      expect(statusCode).toEqual(400);
      expect(body.message).toEqual('Invalid id');
    });

    test('should return 200, user', async () => {
      const user = await User.findOne({ email: userRoleAdmin.email });
      if (!user)
        throw new Error(`user: ${userRoleAdmin.email} , not found in [db]`);

      const id = user._id.toString();

      const { statusCode, body } = await request(app)
        .get(`/api/v1/users/${id}`)
        .set({ Authorization: `Bearer ${token}` });

      expect(statusCode).toEqual(200);
      expect(body._id).toEqual(id);
      expect(body.email).toEqual(user.email);
      expect(body.password).toBeUndefined();
      expect(body.nodes).toBeTruthy();
    });

    test('should return 401, Unauthorized -  Bad Token', async () => {
      const { statusCode, text } = await request(app)
        .get(`/api/v1/users/${id}`)
        .set({ Authorization: `Bearer 4i4i4i` });
      expect(statusCode).toEqual(401);
      expect(text).toEqual('Unauthorized');
    });
  });

  describe('[POST] /users', () => {
    test('should return 400, Bad Request, "password" length must be at least 5 characters long', async () => {
      const inputData = {
        name: 'Usuario test',
        email: 'usuariotest@email.com',
        password: 'd87',
        role: 'user',
      };
      const { statusCode, body } = await request(app)
        .post('/api/v1/users')
        .set({ Authorization: `Bearer ${token}` })
        .send(inputData);
      expect(statusCode).toBe(400);
      expect(body.message).toBe(
        '"password" length must be at least 5 characters long'
      );
    });

    test('should return 400, Bad Request, "name" is required. "role" is required', async () => {
      const inputData = {
        email: 'usuariotest@email.com',
        password: 'd87asda3',
      };
      const { statusCode, body } = await request(app)
        .post('/api/v1/users')
        .set({ Authorization: `Bearer ${token}` })
        .send(inputData);
      expect(statusCode).toBe(400);
      expect(body.message).toBe('"name" is required. "role" is required');
    });

    test('should return 401, Unauthorized - Bad Token', async () => {
      const inputData = {
        name: 'Usuario Test',
        email: 'usuariotest@email.com',
        password: 'd87',
        role: 'user',
      };
      const { statusCode, text } = await request(app)
        .post('/api/v1/users')
        .set({ Authorization: `Bearer 1232312s34534fwr2` })
        .send(inputData);
      expect(statusCode).toBe(401);
      expect(text).toEqual('Unauthorized');
    });

    test('should return 201, created', async () => {
      const inputData = {
        name: 'Usuario Test',
        email: 'usuariotest@email.com',
        password: 'd872342mj',
        role: 'user',
      };
      const { statusCode, body, headers } = await request(app)
        .post('/api/v1/users')
        .set({ Authorization: `Bearer ${token}` })
        .send(inputData);

      expect(statusCode).toBe(201);
      expect(body._id).toBeDefined();
      expect(body.name).toEqual(inputData.name);
      expect(body.email).toEqual(inputData.email);
      expect(body.password).toBeUndefined();
      expect(body.role).toEqual(inputData.role);
      expect(body.enabled).toBe(true);
      expect(headers['content-type']).toMatch(/json/);
    });
  });

  describe('[PATCH] /users/{id}', () => {
    test('should return 401, Unauthorized - Bad Token', async () => {
      const { statusCode, text } = await request(app)
        .patch(`/api/v1/users/${id}`)
        .set({ Authorization: `Bearer 4i4i4i` });
      expect(statusCode).toEqual(401);
      expect(text).toEqual('Unauthorized');
    });

    test('should return 200, user', async () => {
      const user = await User.findOne({ email: userRoleUser.email });
      if (!user)
        throw new Error(`user: ${userRoleUser.email} , not found in [db]`);

      const id = user._id.toString();

      const inputData = {
        name: 'Usuario Y',
        email: 'usuarioy@email.com',
        password: '234234234&h',
      };

      const { statusCode, body } = await request(app)
        .patch(`/api/v1/users/${id}`)
        .send(inputData)
        .set({ Authorization: `Bearer ${token}` });

      expect(statusCode).toEqual(200);
      // * the application returns the old user but if it updates
      expect(body._id).toEqual(id);
      expect(body.password).toBeUndefined();
      expect(body.enabled).toBeTruthy();

      // * Verification with db:
      const userUpdated = await User.findOne({ email: 'usuarioy@email.com' });
      if (!userUpdated) throw new Error('User not found');

      const isMatch = await brcypt.compare(
        inputData.password,
        userUpdated.password
      );

      expect(userUpdated?.name).toEqual(inputData.name);
      expect(isMatch).toBeTruthy();
    });
  });

  describe('[DELETE] /users/{id}', () => {
    test('should return 401, Unauthorized - Bad Token', async () => {
      const { statusCode, text } = await request(app)
        .delete(`/api/v1/users/${id}`)
        .set({ Authorization: `Bearer 4i4i4i` });
      expect(statusCode).toEqual(401);
      expect(text).toEqual('Unauthorized');
    });

    test('should return 400, Bad Request - Invalid id', async () => {
      const { statusCode, body } = await request(app)
        .delete(`/api/v1/users/61e457adf8gce89bf43dcbc`)
        .set({ Authorization: `Bearer ${token}` });
      expect(statusCode).toEqual(400);
      expect(body.message).toEqual('Invalid id');
    });

    test('should return 200, User Y - Deleted', async () => {
      const user = await User.findOne({ email: 'usuarioy@email.com' });

      if (!user) throw new Error('User was not found in [db]');
      id = user._id.toString();

      const { statusCode, body } = await request(app)
        .delete(`/api/v1/users/${id}`)
        .set({ Authorization: `Bearer ${token}` });
      expect(statusCode).toEqual(200);
      expect(body.id).toEqual(id);

      const userDeleted = await User.findById(id);
      if (userDeleted) throw new Error('User was not deleted');
    });
  });
});
