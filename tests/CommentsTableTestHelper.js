/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

export const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    owner = 'user-123',
    threadId = 'thread-123',
    content = 'sebuah comment',
    isDeleted = false,
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO comments (id, owner, thread_id, content, is_deleted, date) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, owner, threadId, content, isDeleted, date],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};
