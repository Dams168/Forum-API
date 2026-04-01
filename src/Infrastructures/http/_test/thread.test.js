import request from 'supertest';

import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AccessTokenTestHelper from '../../../../tests/AccessTokenTestHelper.js';
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
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'Thread Title',
        body: 'Thread Body',
      };

      const { accessToken } = await AccessTokenTestHelper.getAccessToken(tokenManager);

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

      const { accessToken } = await AccessTokenTestHelper.getAccessToken(tokenManager);

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

      const { accessToken } = await AccessTokenTestHelper.getAccessToken(tokenManager);

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
    it('should response 200 and detail thread including comments and replies', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread Body',
        date: '2021-08-08T07:19:09.775Z',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: thread.id,
        content: 'sebuah comment',
        date: '2021-08-08T07:19:18.982Z',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-456',
        commentId: 'comment-123',
        content: 'balasan pertama',
        date: '2021-08-08T07:59:48.766Z',
        isDeleted: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        owner: 'user-123',
        commentId: 'comment-123',
        content: 'balasan kedua',
        date: '2021-08-08T08:07:01.522Z',
      });

      const response = await request(server).get(`/threads/${thread.id}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual(thread.id);
      expect(response.body.data.thread.title).toEqual(thread.title);
      expect(response.body.data.thread.body).toEqual(thread.body);
      expect(response.body.data.thread.date).toEqual(thread.date);
      expect(response.body.data.thread.comments).toHaveLength(1);
      const [comment] = response.body.data.thread.comments;
      expect(comment.id).toEqual('comment-123');
      expect(comment.content).toEqual('sebuah comment');
      expect(comment.replies).toHaveLength(2);
      expect(comment.replies[0]).toMatchObject({
        id: 'reply-123',
        content: '**balasan telah dihapus**',
        username: 'johndoe',
      });
      expect(comment.replies[1]).toMatchObject({
        id: 'reply-456',
        content: 'balasan kedua',
        username: 'dicoding',
      });
    });
    it('should response 404 when thread not found', async () => {
      const response = await request(server).get('/threads/thread-999');

      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Thread not found');
    });
  });
});
