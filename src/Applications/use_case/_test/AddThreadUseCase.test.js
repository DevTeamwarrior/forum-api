

import { describe, it, expect, beforeEach } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';

describe('AddThreadUseCase', () => {
  let userId;
  let globalPool;
  beforeEach(async () => {
    if (!globalPool) {
      globalPool = (await import('../../../Infrastructures/database/postgres/pool.js')).default;
    }
    userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  });
  it('should orchestrate the add thread action correctly and persist to DB', async () => {
    // Gunakan satu client/connection untuk seluruh operasi agar atomic
    const client = await globalPool.connect();
    try {
      // Insert user pakai helper dengan explicit client agar commit di connection yang sama
      await UsersTableTestHelper.addUser({ id: userId, username: userId, password: 'secret', fullname: 'User 123', hashPassword: true, client });

      // Arrange
      const useCasePayload = {
        title: 'Judul thread',
        body: 'Isi thread',
        owner: userId,
      };

      // Gunakan implementasi asli repository agar benar-benar insert ke DB
      const ThreadRepositoryPostgres = (await import('../../../Infrastructures/repository/ThreadRepositoryPostgres.js')).default;
      const fakeIdGenerator = () => '123';
      // Inject client ke repository agar insert thread pakai connection yang sama
      const threadRepository = new ThreadRepositoryPostgres(client, fakeIdGenerator);
      const addThreadUseCase = new AddThreadUseCase({ threadRepository });

      // Action
      await addThreadUseCase.execute(useCasePayload);
      const maxWaitThread = 10000;
      const pollIntervalThread = 100;
      let waitedThread = 0;
      let threadResult;
      while (waitedThread < maxWaitThread) {
        threadResult = await client.query('SELECT * FROM threads WHERE id = $1', ['thread_123']);
        if (threadResult.rowCount > 0) break;
        await new Promise(r => setTimeout(r, pollIntervalThread));
        waitedThread += pollIntervalThread;
      }
      if (!(threadResult && threadResult.rowCount === 1)) {
        // Log untuk debugging jika polling thread gagal
        console.error('Polling thread gagal (client). threadId: thread_123, waited:', waitedThread, 'result:', threadResult);
      }
      expect(threadResult.rowCount).toBe(1);
      expect(threadResult.rows[0].title).toBe(useCasePayload.title);
      expect(threadResult.rows[0].body).toBe(useCasePayload.body);
      expect(threadResult.rows[0].owner).toBe(useCasePayload.owner);
    } finally {
      client.release();
    }
  }, 20000);
  }, 20000);
