import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import pool from '../../database/postgres/pool.js';
describe('ReplyRepositoryPostgres', () => {
  let userId, threadId, commentId, replyId, fakeIdGenerator, repo, client;
  const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  let globalPool;
  beforeEach(async () => {
    if (!globalPool) {
      globalPool = (await import('../../database/postgres/pool.js')).default;
    }
    client = await pool.connect();
    userId = makeId('user');
    threadId = makeId('thread');
    commentId = makeId('comment');
    const unique = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    replyId = `reply-${unique}`;
    fakeIdGenerator = () => unique;
    repo = new ReplyRepositoryPostgres(client, fakeIdGenerator);
    try {
      await client.query('BEGIN');
      // Insert user
      await client.query(`INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, 'secret', 'User 123 Reply')`, [userId, userId]);
      // Poll for user visibility (in transaction)
      const maxWait = 10000;
      const pollInterval = 100;
      let waited = 0;
      let found;
      while (waited < maxWait) {
        found = await client.query('SELECT 1 FROM users WHERE id = $1', [userId]);
        if (found.rowCount > 0) break;
        await new Promise(r => setTimeout(r, pollInterval));
        waited += pollInterval;
      }
      if (!(found && found.rowCount)) {
        throw new Error('User not found after polling');
      }
      // Insert thread
      await client.query(`INSERT INTO threads (id, title, body, owner) VALUES ($1, 'judul', 'isi', $2)`, [threadId, userId]);
      // Poll for thread visibility (in transaction)
      waited = 0;
      while (waited < maxWait) {
        found = await client.query('SELECT 1 FROM threads WHERE id = $1', [threadId]);
        if (found.rowCount > 0) break;
        await new Promise(r => setTimeout(r, pollInterval));
        waited += pollInterval;
      }
      if (!(found && found.rowCount)) {
        throw new Error('Thread not found after polling');
      }
      // Insert comment
      await client.query(`INSERT INTO comments (id, content, thread_id, owner, date, is_delete) VALUES ($1, 'komentar', $2, $3, NOW(), false)`, [commentId, threadId, userId]);
      // Poll for comment visibility (in transaction)
      waited = 0;
      while (waited < maxWait) {
        found = await client.query('SELECT 1 FROM comments WHERE id = $1', [commentId]);
        if (found.rowCount > 0) break;
        await new Promise(r => setTimeout(r, pollInterval));
        waited += pollInterval;
      }
      if (!(found && found.rowCount)) {
        throw new Error('Comment not found after polling');
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  });

  it('should add reply', async () => {
    const newReply = { content: 'balasan', commentId: commentId, owner: userId };
    const registered = await repo.addReply(newReply);
    expect(registered.id).toBe(replyId);
    expect(registered.content).toBe('balasan');
    expect(registered.owner).toBe(userId);
  });

  it('should delete reply (soft delete)', async () => {
    // Insert reply terlebih dahulu
    await repo.addReply({ content: 'balasan', commentId: commentId, owner: userId });
    // Pastikan reply ada sebelum dihapus
    await expect(repo.deleteReply(replyId, userId)).resolves.toBeUndefined();
  });

  it('should throw error if reply not found', async () => {
    // Tidak insert reply apapun
    await expect(repo.deleteReply('not-exist', userId)).rejects.toThrowError('reply tidak ditemukan');
  });

  it('should throw error if not owner', async () => {
    // Insert reply dengan owner userId
    await repo.addReply({ content: 'balasan', commentId: commentId, owner: userId });
    // Coba hapus dengan owner berbeda
    const otherUserId = makeId('user');
    // Insert user lain menggunakan client yang sama agar terlihat dalam transaksi
    await client.query(`INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, 'secret', 'User 456 Reply')`, [otherUserId, otherUserId]);
    // Make sure the other user exists, tapi tidak memiliki reply
    await expect(repo.deleteReply(replyId, otherUserId)).rejects.toThrowError('anda tidak berhak mengakses resource ini');
  });
  
  afterEach(async () => {
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM replies WHERE id = $1', [replyId]);
      await client.query('DELETE FROM comments WHERE id = $1', [commentId]);
      await client.query('DELETE FROM threads WHERE id = $1', [threadId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      if (client) {
        client.release();
      }
    }
  });

// No need to close pool in afterAll; let global teardown handle it
});
