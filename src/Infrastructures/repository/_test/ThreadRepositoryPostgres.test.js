import pool from '../../database/postgres/pool.js';
import AddThread from '../../../Domains/threads/entities/AddThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import { afterEach, beforeEach, expect } from 'vitest';
import { ThreadsTableTestHelper } from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';

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
});
