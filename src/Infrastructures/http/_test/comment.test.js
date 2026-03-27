import request from 'supertest';

import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
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

  const getAccessToken = async () => {
    const unique = Date.now();
    const userId = `user-${unique}`;
    const username = `dicoding-${unique}`;

    await UsersTableTestHelper.addUser({ id: userId, username });
    const accessToken = await tokenManager.createAccessToken({ id: userId, username });

    return { accessToken, userId };
  };

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const requestPayload = {
        content: 'sebuah comment',
      };

      const { accessToken, userId } = await getAccessToken();
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

      const { accessToken, userId } = await getAccessToken();
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
  });
});
