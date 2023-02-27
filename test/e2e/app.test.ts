import request from 'supertest';
import createApp from '../../src/app';
import { Express } from 'express';

import { disconnectDB } from '../../src/libs/mongoose';

describe('test for / path', () => {
  let app: Express;
  let server: any = null;
  const port = 9000;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(port);
  });

  afterAll(async () => {
    await disconnectDB();
    server.close();
  });

  describe('[GET] /', () => {
    test('should return 200', async () => {
      const { statusCode } = await request(app).get('/');
      expect(statusCode).toBe(200);
    });
  });
});
