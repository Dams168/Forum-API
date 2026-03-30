import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AddReply from '../../../Domains/replies/entities/AddReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist the reply', async () => {
      // Arrange
      const newReply = new AddReply({
        content: 'sebuah balasan',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(newReply, 'user-123', 'comment-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const newReply = new AddReply({
        content: 'sebuah balasan',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(
        newReply,
        'user-123',
        'comment-123',
      );

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        }),
      );
    });
  });
});
