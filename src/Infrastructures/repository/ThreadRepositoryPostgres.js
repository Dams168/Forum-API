import ThreadRepository from '../../Domains/threads/ThreadRepository.js';
import AddedThread from '../../Domains/threads/entities/AddedThread.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';

const toISOStringPreservingLocal = (dateValue) =>
  new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString();

export default class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyThreadById(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread not found');
    }
  }

  async getDetailThreadById(id) {
    const query = {
      text: `
        SELECT threads.id, threads.title, threads.body, threads.date, users.username
        FROM threads
        JOIN users ON users.id = threads.owner
        WHERE threads.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread not found');
    }

    const { title, body, date, username } = result.rows[0];

    return {
      id,
      title,
      body,
      date: toISOStringPreservingLocal(date),
      username,
    };
  }

  async addThread(newThread, owner) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads (id, title, body, owner) VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }
}
