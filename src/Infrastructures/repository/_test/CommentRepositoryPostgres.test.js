import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import pool from '../../database/postgres/pool.js';
import bcrypt from 'bcrypt';

describe('CommentRepositoryPostgres', () => {
  let userId, threadId, commentId, fakeIdGenerator, repo, unique, client;
  const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  beforeEach(async () => {
    client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM comments');
      await client.query('DELETE FROM threads');
      await client.query('DELETE FROM users');
      unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      userId = makeId('user');
      threadId = makeId('thread');
      commentId = `comment_${unique}`;
      fakeIdGenerator = () => unique;
      repo = new CommentRepositoryPostgres(client, fakeIdGenerator);
      // Insert user
      const hashedPassword = await bcrypt.hash('secret', 10);
      await client.query(`INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, 'User 123')`, [userId, userId, hashedPassword]);
      // Polling user (maks 20 detik) dalam transaksi
      const maxWait = 20000;
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
        // Log untuk debugging race condition
        console.error('Polling user gagal. userId:', userId, 'waited:', waited, 'foundUser:', foundUser);
        throw new Error('User not found after polling, cannot insert thread');
      }
      await client.query(`INSERT INTO threads (id, title, body, owner) VALUES ($1, 'judul', 'isi', $2)`, [threadId, userId]);
      // Polling thread dalam transaksi
      let waitedThread = 0;
      let foundThread;
      while (waitedThread < maxWait) {
        foundThread = await client.query('SELECT 1 FROM threads WHERE id = $1', [threadId]);
        if (foundThread.rowCount > 0) break;
        await new Promise(r => setTimeout(r, pollInterval));
        waitedThread += pollInterval;
      }
      if (!(foundThread && foundThread.rowCount)) {
        console.error('Polling thread gagal. threadId:', threadId, 'waited:', waitedThread, 'foundThread:', foundThread);
        throw new Error('Thread not found after polling, cannot insert comment');
      }
      // Tambahkan polling ekstra untuk memastikan thread benar-benar visible sebelum insert comment
      let waitedThreadExtra = 0;
      let foundThreadExtra;
      while (waitedThreadExtra < maxWait) {
        foundThreadExtra = await client.query('SELECT 1 FROM threads WHERE id = $1', [threadId]);
        if (foundThreadExtra.rowCount > 0) break;
        await new Promise(r => setTimeout(r, pollInterval));
        waitedThreadExtra += pollInterval;
      }
      if (!(foundThreadExtra && foundThreadExtra.rowCount)) {
        console.error('Polling thread ekstra gagal. threadId:', threadId, 'waited:', waitedThreadExtra, 'foundThreadExtra:', foundThreadExtra);
        throw new Error('Thread not found after extra polling, cannot insert comment');
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  });

  it('should add and get comment', async () => {
    // Ensure thread exists before adding comment
    const threadCheck = await client.query('SELECT id FROM threads WHERE id = $1', [threadId]);
    expect(threadCheck.rowCount).toBe(1);
    const newComment = { content: 'komentar', thread_id: threadId, owner: userId };
    const registered = await repo.addComment(newComment);
    expect(registered.id).toBe(commentId);
    expect(registered.content).toBe('komentar');
    expect(registered.owner).toBe(userId);
  });

  it('should delete comment', async () => {
    await repo.addComment({ content: 'komentar', thread_id: threadId, owner: userId });
    const deletedId = await repo.deleteComment(commentId, userId);
    expect(deletedId).toBe(commentId);
  });

  it('should throw error if comment not found or not owner', async () => {
    await expect(repo.deleteComment('not-exist', userId)).rejects.toThrowError();
  });
  

  afterEach(async () => {
    try {
      await client.query('BEGIN');
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
});
