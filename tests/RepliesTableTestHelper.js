import pool from '../src/Infrastructures/database/postgres/pool.js';

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'sebuah balasan',
    owner = 'user-123',
    commentId = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, owner, comment_id) VALUES($1, $2, $3, $4)',
      values: [id, content, owner, commentId],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

export default RepliesTableTestHelper;
