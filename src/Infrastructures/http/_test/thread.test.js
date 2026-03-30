import request from 'supertest';

import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import createServer from '../../http/createServer.js';
import container from '../../container.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import { describe } from 'vitest';

describe('Threads endpoint', () => {
  let server;
  let tokenManager;

  beforeAll(async () => {
    server = await createServer(container);
    tokenManager = container.getInstance(AuthenticationTokenManager.name);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  const getAccessToken = async () => {
    const unique = Date.now();
    const userId = `user-${unique}`;
    const username = `dicoding-${unique}`;

    await UsersTableTestHelper.addUser({ id: userId, username });
    const accessToken = await tokenManager.createAccessToken({ id: userId, username });

    return { accessToken, userId };
  };

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'Thread Title',
        body: 'Thread Body',
      };

      const { accessToken } = await getAccessToken();

      const response = await request(server)
        .post('/threads')
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        title: 'Thread Title',
      };

      const { accessToken } = await getAccessToken();

      const response = await request(server)
        .post('/threads')
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        title: 12345,
        body: 'lorem ipsum',
      };

      const { accessToken } = await getAccessToken();

      const response = await request(server)
        .post('/threads')
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak sesuai dengan spesifikasi data type',
      );
    });

    it('should response 401 when request payload not contain valid access token', async () => {
      const requestPayload = {
        title: 'Thread Title',
        body: 'Thread Body',
      };

      const response = await request(server).post('/threads').send(requestPayload);

      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and detail thread', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread Body',
        date: '2021-08-08T07:19:09.775Z',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'john_doe' });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: 'user-123' });

      const response = await request(server).get(`/threads/${thread.id}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual(thread.id);
      expect(response.body.data.thread.title).toEqual(thread.title);
      expect(response.body.data.thread.body).toEqual(thread.body);
      expect(response.body.data.thread.date).toEqual(thread.date);
    });
    it('should response 404 when thread not found', async () => {
      const response = await request(server).get('/threads/thread-999');

      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Thread not found');
    });
  });
});
