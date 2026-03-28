import AddedComment from '../../Domains/comments/entitities/AddedComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';

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
}
