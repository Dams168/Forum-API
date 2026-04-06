import LikeCommentRepositoryPostgres from '../LikeCommentRepositoryPostgres';
import pool from '../../database/postgres/pool.js';

import { LikesTableTestHelper } from '../../../../tests/LikesTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import { CommentsTableTestHelper } from '../../../../tests/CommentsTableTestHelper.js';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';

describe('LikeCommentRepositoryPostgres interface', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
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
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      content: 'sebuah comment',
      owner: 'user-123',
      threadId: 'thread-123',
    });
  });

  describe('checkIfUserHasLikedComment function', () => {
    it('should return true if user has liked the comment', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123' });
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      const hasLiked = await likeCommentRepositoryPostgres.checkIfUserHasLikedComment(
        'comment-123',
        'user-123',
      );
      // Assert
      expect(hasLiked).toBe(true);
    });
    it('should return false if user has not liked the comment', async () => {
      // Arrange
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      const hasLiked = await likeCommentRepositoryPostgres.checkIfUserHasLikedComment(
        'comment-123',
        'user-123',
      );
      // Assert
      expect(hasLiked).toBe(false);
    });
  });

  describe('addLikeComment function', () => {
    it('should persist the like comment', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeCommentRepositoryPostgres.addLikeComment('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });
    it('should return added like comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedLikeComment = await likeCommentRepositoryPostgres.addLikeComment(
        'comment-123',
        'user-123',
      );

      // Assert
      expect(addedLikeComment).toStrictEqual({
        id: 'like-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });
    });
  });

  describe('unLikeComment function', () => {
    it('should delete the like comment', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123' });
      const fakeIdGenerator = () => '123'; // stub!
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      // Action
      await likeCommentRepositoryPostgres.unLikeComment('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
    it('should not delete the like comment if user has not liked the comment', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeCommentRepositoryPostgres.unLikeComment('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('countLikeComment function', () => {
    it('should return the count of like comment', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123' });
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      const count = await likeCommentRepositoryPostgres.countLikeComment('comment-123');

      // Assert
      expect(count).toBe(1);
    });
    it('should return zero if comment has no like', async () => {
      // Arrange
      const likeCommentRepositoryPostgres = new LikeCommentRepositoryPostgres(pool, {});

      // Action
      const count = await likeCommentRepositoryPostgres.countLikeComment('comment-123');

      // Assert
      expect(count).toBe(0);
    });
  });
});
