import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

const toISOStringPreservingLocal = (dateValue) =>
  new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString();

export default class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply, owner, commentId) {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies(id, owner, comment_id, content, date) VALUES($1, $2, $3, $4, $5) RETURNING id, owner, comment_id, content',
      values: [id, owner, commentId, content, date],
    };

    const result = await this._pool.query(query);
    const { id: replyId, owner: replyOwner, content: replyContent } = result.rows[0];
    return new AddedReply({ id: replyId, owner: replyOwner, content: replyContent });
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT replies.id,
               replies.content,
               replies.date,
               replies.is_deleted AS "isDeleted",
               users.username
        FROM replies
        JOIN users ON users.id = replies.owner
        WHERE replies.comment_id = $1
        ORDER BY replies.date ASC
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(({ id, content, date, username, isDeleted }) => ({
      id,
      content,
      date: toISOStringPreservingLocal(new Date(date)),
      username,
      isDeleted,
    }));
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Reply not found');
    }

    const { owner: replyOwner } = result.rows[0];

    if (replyOwner !== owner) {
      throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
    }
  }

  async checkAvailabilityReply(replyId, commentId) {
    const query = {
      text: 'SELECT comment_id, is_deleted FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Reply not found');
    }

    const { comment_id: storedCommentId, is_deleted: isDeleted } = result.rows[0];

    if (storedCommentId !== commentId) {
      throw new NotFoundError('Reply not found in comment');
    }

    if (isDeleted) {
      throw new NotFoundError('Reply not found');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }
}
