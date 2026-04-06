import LikeRepository from '../../Domains/likes/LikeRepository.js';

export default class LikeCommentRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkIfUserHasLikedComment(commentId, userId) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }
  async addLikeComment(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO user_comment_likes (id, comment_id, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    };

    const result = await this._pool.query(query);

    return {
      id: result.rows[0].id,
      commentId,
      owner: userId,
    };
  }
  async unLikeComment(commentId, userId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }
  async countLikeComment(commentId) {
    const query = {
      text: 'SELECT COUNT(*) AS count FROM user_comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return parseInt(result.rows[0].count);
  }
}
