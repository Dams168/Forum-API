import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import { LikesTableTestHelper } from '../../../../tests/LikesTableTestHelper.js';
import AccessTokenTestHelper from '../../../../tests/AccessTokenTestHelper.js';
import createServer from '../../http/createServer.js';
import container from '../../container.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('Likes endpoint', () => {
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
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and persist like when comment has not been liked', async () => {
      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

      const response = await request(server)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      const likeCount = await LikesTableTestHelper.countLikeByCommentId(commentId);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(likeCount).toEqual(1);
    });

    it('should response 200 and remove like when comment has been liked', async () => {
      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId, owner: userId });

      const response = await request(server)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      const likeCount = await LikesTableTestHelper.countLikeByCommentId(commentId);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(likeCount).toEqual(0);
    });

    it('should response 404 when thread not found', async () => {
      const { accessToken } = await AccessTokenTestHelper.getAccessToken(tokenManager);

      const response = await request(server)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Thread not found');
    });

    it('should response 404 when comment not found', async () => {
      const { accessToken, userId } = await AccessTokenTestHelper.getAccessToken(tokenManager);
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const response = await request(server)
        .put(`/threads/${threadId}/comments/comment-123/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Comment not found');
    });

    it('should response 401 when request does not contain access token', async () => {
      const response = await request(server).put('/threads/thread-123/comments/comment-123/likes');

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });
  });
});
