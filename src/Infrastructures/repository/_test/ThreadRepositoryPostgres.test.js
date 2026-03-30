import pool from '../../database/postgres/pool.js';
import AddThread from '../../../Domains/threads/entities/AddThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import { afterEach, beforeEach, expect } from 'vitest';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await UsersTableTestHelper.addUser({ id: 'user-123' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addThread function', () => {
    it('should persist add thread ', async () => {
      const newAddThread = new AddThread({
        title: 'Thread Title',
        body: 'Thread Body',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      //act
      await threadRepositoryPostgres.addThread(newAddThread, 'user-123');

      //assert

      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });
    it('should return added thread correctly ', async () => {
      const newAddThread = new AddThread({
        title: 'Thread Title',
        body: 'Thread Body',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      //act
      const newAddedThread = await threadRepositoryPostgres.addThread(newAddThread, 'user-123');

      //assert
      expect(newAddedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Thread Title',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('getDetailThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getDetailThreadById('thread-999')).rejects.toThrowError(
        new NotFoundError('Thread not found'),
      );
    });

    it('should return detail thread correctly', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const customDate = new Date('2021-08-08T07:19:09.775Z');
      const timezoneNeutralDate = new Date(
        customDate.getTime() - customDate.getTimezoneOffset() * 60000,
      ).toISOString();

      await pool.query(
        'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
        ['thread-321', 'sebuah thread', 'sebuah body thread', 'user-123', customDate],
      );

      const detailThread = await threadRepositoryPostgres.getDetailThreadById('thread-321');

      expect(detailThread).toStrictEqual({
        id: 'thread-321',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        username: 'dicoding',
        date: timezoneNeutralDate,
      });
    });
  });
});
