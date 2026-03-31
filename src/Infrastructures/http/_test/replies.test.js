import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import container from '../../container.js';
import createServer from '../../http/createServer.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import request from 'supertest';

describe('Replies endpoint', () => {
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
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  const getAccessToken = async () => {
    const unique = Date.now();
    const userId = `user-${unique}`;
    const username = `dicoding-${unique}`;

    await UsersTableTestHelper.addUser({ id: userId, username });
    const accessToken = await tokenManager.createAccessToken({ id: userId, username });

    return { accessToken, userId };
  };

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const requestPayload = {
        content: 'sebuah balasan comment',
      };

      const { accessToken, userId } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      const response = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(201);
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeTruthy();
    });
    it('should response 404 when thread not found', async () => {
      const requestPayload = {
        content: 'sebuah balasan comment',
      };

      const { accessToken } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const response = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Thread not found');
    });
    it('should response 404 when comment not found', async () => {
      const requestPayload = {
        content: 'sebuah balasan comment',
      };

      const { accessToken, userId } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Comment not found');
    });
    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {};

      const { accessToken, userId } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      const response = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'Tidak dapat membuat reply baru karena properti content tidak ada',
      );
    });
    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: 123,
      };

      const { accessToken, userId } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      const response = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'Tidak dapat membuat reply baru karena properti content tidak sesuai dengan spesifikasi data type',
      );
    });
    it('should response 401 when request payload not contain access token', async () => {
      const requestPayload = {
        content: 'sebuah balasan comment',
      };

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const response = await request(server)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send(requestPayload);

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply', async () => {
      const { accessToken, userId } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'sebuah balasan',
        owner: userId,
        commentId,
        date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
      });

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
    it('should response 404 when thread not found', async () => {
      const { accessToken } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Thread not found');
    });
    it('should response 404 when comment not found', async () => {
      const { accessToken, userId } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Comment not found');
    });
    it('should response 404 when reply not found', async () => {
      const { accessToken, userId } = await getAccessToken();
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Reply not found');
    });
    it('should response 403 when user is not owner of the reply', async () => {
      const { accessToken } = await getAccessToken();
      const anotherUserId = `user-${Date.now()}`;
      await UsersTableTestHelper.addUser({ id: anotherUserId, username: `dicoding-${Date.now()}` });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: anotherUserId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: anotherUserId, threadId });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        content: 'sebuah balasan',
        owner: anotherUserId,
        commentId,
        date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
      });

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Anda tidak berhak menghapus balasan ini');
    });
    it('should response 401 when request payload not contain access token', async () => {
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const response = await request(server).delete(
        `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      );

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });
  });
});
