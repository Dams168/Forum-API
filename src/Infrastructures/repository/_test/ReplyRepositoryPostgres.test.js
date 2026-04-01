import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import AddReply from '../../../Domains/replies/entities/AddReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import { describe, it } from 'vitest';

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
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
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

  describe('getRepliesByCommentId function', () => {
    it('should return array of replies correctly', async () => {
      // Arrange
      const firstDate = new Date('2021-08-08T07:19:09.775Z');
      const secondDate = new Date('2021-08-08T08:19:09.775Z');
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
        commentId: 'comment-123',
        date: firstDate.toISOString(),
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        content: 'balasan kedua',
        owner: 'user-123',
        commentId: 'comment-123',
        date: secondDate.toISOString(),
        isDeleted: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toStrictEqual([
        {
          id: 'reply-123',
          content: 'sebuah balasan',
          date: firstDate.toISOString(),
          username: 'dicoding',
          isDeleted: false,
        },
        {
          id: 'reply-456',
          content: 'balasan kedua',
          date: secondDate.toISOString(),
          username: 'dicoding',
          isDeleted: true,
        },
      ]);
    });
  });

  describe('verifyReplyOwner function', () => {
    beforeEach(async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
    });

    it('should throw NotFoundError if reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-999', 'user-123'),
      ).rejects.toThrowError(new NotFoundError('Reply not found'));
    });

    it('should throw UnauthorizedError if reply owner is different from the given owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'),
      ).rejects.toThrowError(new AuthorizationError('Anda tidak berhak menghapus balasan ini'));
    });

    it('should not throw error if reply owner is the same as the given owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'),
      ).resolves.not.toThrowError();
    });
  });

  describe('checkAvailabilityReply function', () => {
    it('should throw NotFoundError if reply not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkAvailabilityReply('reply-123', 'comment-123'),
      ).rejects.toThrowError(new NotFoundError('Reply not found'));
    });

    it('should throw NotFoundError when reply is deleted', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
        commentId: 'comment-123',
        date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
        isDeleted: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkAvailabilityReply('reply-123', 'comment-123'),
      ).rejects.toThrowError(new NotFoundError('Reply not found'));
    });

    it('should throw NotFoundError when reply not found in comment', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        owner: 'user-123',
        commentId: 'comment-456',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkAvailabilityReply('reply-456', 'comment-123'),
      ).rejects.toThrowError(new NotFoundError('Reply not found in comment'));
    });

    it('should not throw error if reply is available', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.checkAvailabilityReply('reply-123', 'comment-123'),
      ).resolves.not.toThrowError();
    });
  });

  describe('deleteReplyById function', () => {
    it('should soft delete the reply and update isDeleted field', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
        commentId: 'comment-123',
        date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
        isDeleted: false,
      });

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const deletedReply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(deletedReply[0].is_deleted).toBe(true);
    });
  });
});
