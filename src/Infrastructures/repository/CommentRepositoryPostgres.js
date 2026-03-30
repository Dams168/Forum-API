import AddedComment from '../../Domains/comments/entitities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

export default class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment, owner, threadId) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comments(id, owner, thread_id, content) VALUES($1, $2, $3, $4) RETURNING id, owner, thread_id, content',
      values: [id, owner, threadId, content],
    };

    const result = await this._pool.query(query);
    const { id: commentId, owner: commentOwner, content: commentContent } = result.rows[0];
    return new AddedComment({ id: commentId, owner: commentOwner, content: commentContent });
  }

  async checkAvailabilityComment(commentId, threadId) {
    const query = {
      text: 'SELECT id, is_deleted  FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Comment not found');
    }
    if (result.rows[0].is_deleted) {
      throw new NotFoundError('Comment not valid');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Comment not found');
    }

    const { owner: commentOwner } = result.rows[0];
    if (commentOwner !== owner) {
      throw new AuthorizationError('You are not the owner of this comment');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }
}
