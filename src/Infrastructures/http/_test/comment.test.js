import request from 'supertest';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AccessTokenTestHelper from '../../../../tests/AccessTokenTestHelper.js';
import pool from '../../database/postgres/pool.js';
import createServer from '../../http/createServer.js';
import container from '../../container.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('Comments endpoint', () => {
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
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const requestPayload = {
        content: 'sebuah comment',
      };

      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await request(server)
        .post(`/threads/${threadId}/comments`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
    });
    it('should return added comment correctly', async () => {
      const requestPayload = {
        content: 'sebuah comment',
      };

      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await request(server)
        .post(`/threads/${threadId}/comments`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      const { addedComment } = response.body.data;

      expect(response.statusCode).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(addedComment).toBeDefined();
      expect(addedComment.id).toBeDefined();
      expect(addedComment.content).toEqual(requestPayload.content);
      expect(addedComment.owner).toEqual(userId);
    });

    it('should response 400 when payload does not contain content', async () => {
      const requestPayload = {};
      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await request(server)
        .post(`/threads/${threadId}/comments`)
        .send(requestPayload)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada',
      );
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when request without access token', async () => {
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const response = await request(server).delete(`/threads/${threadId}/comments/${commentId}`);

      expect(response.statusCode).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });
    it('should response 404 when comment not found', async () => {
      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Comment not found');
    });
    it('should response 200 and delete the comment', async () => {
      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
        content: 'sebuah comment',
      });

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toBeTruthy();
    });

    it('should response 403 when deleting comment owned by another user', async () => {
      const requester = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const owner = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      const commentId = 'comment-999';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: requester.userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: owner.userId,
        threadId,
        content: 'comment dari user lain',
      });

      const response = await request(server)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${requester.accessToken}`);

      expect(response.statusCode).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('You are not the owner of this comment');
    });
  });
});
