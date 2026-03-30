import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';

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
}
