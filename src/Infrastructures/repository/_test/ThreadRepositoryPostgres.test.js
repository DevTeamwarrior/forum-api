import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import pool from '../../database/postgres/pool.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';

describe('ThreadRepositoryPostgres', () => {
  let userId, threadId, fakeIdGenerator, repo, unique, client;
  beforeEach(async () => {
    unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    userId = `user_${unique}`;
    threadId = `thread_${unique}`;
    fakeIdGenerator = () => unique;
    client = await pool.connect();
    repo = new ThreadRepositoryPostgres(client, fakeIdGenerator);
    try {
      await client.query('BEGIN');
      const bcrypt = (await import('bcrypt')).default;
      const hashedPassword = await bcrypt.hash('secret', 10);
      await client.query(`INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, 'User 123')`, [userId, userId, hashedPassword]);
      // Polling hingga user benar-benar tersedia di DB sebelum insert thread
      const maxWait = 4000;
      const pollInterval = 100;
      let waited = 0;
      let foundUser;
      while (waited < maxWait) {
        foundUser = await client.query('SELECT 1 FROM users WHERE id = $1', [userId]);
        if (foundUser.rowCount > 0) break;
        await new Promise(r => setTimeout(r, pollInterval));
        waited += pollInterval;
      }
      if (!(foundUser && foundUser.rowCount)) {
        throw new Error('User not found after polling, cannot insert thread');
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable(threadId);
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.release();
  });

  it('should add and get thread', async () => {
    const newThread = { title: 'judul', body: 'isi', owner: userId };
    const registered = await repo.addThread(newThread);
    expect(registered.id).toBe(threadId);
    expect(registered.title).toBe('judul');
    expect(registered.body).toBe('isi');

    // Verifikasi data benar-benar tersimpan di database
    const threads = await ThreadsTableTestHelper.findThreadById(threadId);
    expect(threads).toHaveLength(1);
    expect(threads[0].id).toBe(threadId);
    expect(threads[0].title).toBe('judul');
    expect(threads[0].body).toBe('isi');
    expect(threads[0].owner).toBe(userId);
  });

  it('should get thread by id (raw)', async () => {
    await repo.addThread({ title: 'judul', body: 'isi', owner: userId });
    // Polling thread untuk memastikan sudah committed dan visible
    const maxWait = 5000;
    const pollInterval = 100;
    let waited = 0;
    let found = null;
    while (waited < maxWait) {
      found = await ThreadsTableTestHelper.findThreadById(threadId);
      if (found && found.length > 0) break;
      await new Promise(r => setTimeout(r, pollInterval));
      waited += pollInterval;
    }
    if (!found || found.length === 0) {
      throw new Error('Thread not found after polling');
    }
    const row = await repo.getThreadRowById(threadId);
    expect(row.id).toBe(threadId);
    expect(row.title).toBe('judul');
    // Mapping ke RegisteredThread manual (simulasi use case)
    const RegisteredThread = (await import('../../../Domains/threads/entities/RegisteredThread.js')).default;
    const thread = new RegisteredThread({ id: row.id, title: row.title, body: row.body, owner: row.owner });
    expect(thread.id).toBe(threadId);
    expect(thread.title).toBe('judul');
    // Verifikasi data memang ada di database
    const threads = await ThreadsTableTestHelper.findThreadById(threadId);
    expect(threads).toHaveLength(1);
  });

  it('should throw error if thread not found', async () => {
    await expect(repo.getThreadById('not-exist')).rejects.toThrowError();
    // Verifikasi data memang tidak ada di database
    const threads = await ThreadsTableTestHelper.findThreadById('not-exist');
    expect(threads).toHaveLength(0);
  });
});
