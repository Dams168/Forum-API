import { afterAll, afterEach, beforeEach, describe, it } from 'vitest';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import AddComment from '../../../Domains/comments/entitities/AddComment.js';
import AddedComment from '../../../Domains/comments/entitities/AddedComment.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

const toISOStringPreservingLocal = (dateValue) =>
  new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString();

describe('a CommentRepository interface', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  describe('addComment function', () => {
    it('should persist the comment', async () => {
      // Arrange
      const newComment = new AddComment({
        content: 'sebuah comment',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(newComment, 'user-123', 'thread-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });
    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new AddComment({
        content: 'sebuah comment',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment,
        'user-123',
        'thread-123',
      );

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: newComment.content,
          owner: 'user-123',
        }),
      );
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        commentRepositoryPostgres.checkAvailabilityComment('comment-123', 'thread-123'),
      ).rejects.toThrowError(new NotFoundError('Comment not found'));

      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(0);
    });
    it('should throw NotFoundError when comment is deleted', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: true,
      });

      // Action and Assert
      await expect(
        commentRepositoryPostgres.checkAvailabilityComment('comment-123', 'thread-123'),
      ).rejects.toThrowError(new NotFoundError('Comment not valid'));
    });

    it('should not throw NotFoundError when comment is available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: false,
      });

      // Action and Assert
      await expect(
        commentRepositoryPostgres.checkAvailabilityComment('comment-123', 'thread-123'),
      ).resolves.not.toThrowError();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).rejects.toThrowError(new NotFoundError('Comment not found'));
    });
    it('should throw AuthorizationError when user is not the owner of the comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'dicoding2' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-456',
        threadId: 'thread-123',
        isDeleted: false,
      });

      // Action and Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).rejects.toThrowError(new AuthorizationError('You are not the owner of this comment'));
    });
    it('should not throw AuthorizationError when user is the owner of the comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: false,
      });

      // Action and Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrowError();
    });
  });

  describe('deleteCommentById function', () => {
    it('should soft delete the comment and update field isDeleted', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: false,
      });

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toBe(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when thread has no comments', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toStrictEqual([]);
    });

    it('should return comments ordered by date with correct mapping', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-111',
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'first comment',
        isDeleted: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-222',
        owner: 'user-123',
        threadId: 'thread-123',
        content: 'second comment',
        isDeleted: true,
      });

      await pool.query('UPDATE comments SET date = $1 WHERE id = $2', [
        new Date('2021-08-08T07:19:09.775Z'),
        'comment-111',
      ]);
      await pool.query('UPDATE comments SET date = $1 WHERE id = $2', [
        new Date('2021-09-08T07:19:09.775Z'),
        'comment-222',
      ]);

      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);
      expect(comments[0]).toMatchObject({
        id: 'comment-111',
        content: 'first comment',
        username: 'dicoding',
        isDeleted: false,
      });
      expect(comments[1]).toMatchObject({
        id: 'comment-222',
        content: 'second comment',
        username: 'dicoding',
        isDeleted: true,
      });
      expect(comments[0].date).toBe(
        toISOStringPreservingLocal(new Date('2021-08-08T07:19:09.775Z')),
      );
      expect(comments[1].date).toBe(
        toISOStringPreservingLocal(new Date('2021-09-08T07:19:09.775Z')),
      );
    });
  });
});
