/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';
export const LikesTableTestHelper = {
  async addLike({ id = 'like-123', commentId = 'comment-123', owner = 'user-123' }) {
    const query = {
      text: 'INSERT INTO user_comment_likes(id, comment_id, owner) VALUES($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM user_comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async unLike({ commentId = 'comment-123', owner = 'user-123' }) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await pool.query(query);
  },

  async countLikeByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) AS count FROM user_comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);

    return parseInt(result.rows[0].count);
  },
  async cleanTable() {
    await pool.query('DELETE FROM user_comment_likes');
  },
};
