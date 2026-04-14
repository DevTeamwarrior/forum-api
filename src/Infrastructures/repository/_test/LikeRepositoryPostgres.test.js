import { describe, it, expect, beforeEach, vi } from 'vitest';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';

const fakePool = () => {
  const queries = [];
  // Simpan state like: key = `${commentId}:${userId}`
  const stateLike = new Set();
  return {
    query: vi.fn(async (q, v = []) => {
      queries.push({ q, v });
      // Gunakan q.values jika ada, fallback ke v
      const values = q.values || v;
      // Key selalu `${commentId}:${userId}`
      // SELECT id FROM comment_likes
      if (q.text && q.text.startsWith('SELECT id FROM comment_likes')) {
        const key = `${values[0]}:${values[1]}`;
        return { rowCount: stateLike.has(key) ? 1 : 0 };
      }
      // DELETE FROM comment_likes
      if (q.text && q.text.startsWith('DELETE FROM comment_likes')) {
        const key = `${values[0]}:${values[1]}`;
        const existed = stateLike.delete(key);
        return { rowCount: existed ? 1 : 0 };
      }
      // INSERT INTO comment_likes
      if (q.text && q.text.startsWith('INSERT INTO comment_likes')) {
        // INSERT INTO comment_likes (id, comment_id, user_id) VALUES ($1, $2, $3)
        const key = `${values[1]}:${values[2]}`;
        stateLike.add(key);
        return { rowCount: 1 };
      }
      // SELECT COUNT(*) FROM comment_likes
      if (q.text && q.text.startsWith('SELECT COUNT(*)')) {
        // Hitung jumlah like untuk commentId
        const commentId = values[0];
        const count = Array.from(stateLike).filter(k => k.startsWith(`${commentId}:`)).length;
        return { rows: [{ count: count.toString() }] };
      }
      // SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2
      if (q.text && q.text.startsWith('SELECT 1 FROM comment_likes')) {
        const key = `${values[0]}:${values[1]}`;
        return { rowCount: stateLike.has(key) ? 1 : 0 };
      }
      return { rowCount: 1 };
    }),
    queries,
    stateLike,
  };
};

describe('LikeRepositoryPostgres', () => {
  let repo, pool;
  beforeEach(() => {
    pool = fakePool();
    repo = new LikeRepositoryPostgres(pool, () => 'abc');
    // Selalu reset stateLike
    pool.stateLike.clear();
  });

  it('should like comment if not liked', async () => {
    pool.stateLike.clear();
    const result = await repo.toggleLikeComment('not_liked_comment', 'user');
    expect(result.liked).toBe(true);
    expect(pool.queries[0].q.text).toMatch(/SELECT id FROM comment_likes/);
    expect(pool.queries[1].q.text).toMatch(/INSERT INTO comment_likes/);
  });

  it('should unlike comment if already liked', async () => {
    pool.stateLike.clear();
    pool.stateLike.add('liked_comment:user');
    const result = await repo.toggleLikeComment('liked_comment', 'user');
    expect(result.liked).toBe(false);
    expect(pool.queries[0].q.text).toMatch(/SELECT id FROM comment_likes/);
    expect(pool.queries[1].q.text).toMatch(/DELETE FROM comment_likes/);
    expect(pool.stateLike.size).toBe(0);
  });

  it('should get like count', async () => {
    pool.stateLike.clear();
    pool.stateLike.add('any:user1');
    const result = await repo.toggleLikeComment('any', 'user1');
    expect(result.liked).toBe(false);
    expect(pool.queries[0].q.text).toMatch(/SELECT id FROM comment_likes/);
    expect(pool.queries[1].q.text).toMatch(/DELETE FROM comment_likes/);
    expect(pool.stateLike.size).toBe(0);
  });

  it('should get like count', async () => {
    pool.stateLike.clear();
    pool.stateLike.add('any:user1');
    pool.stateLike.add('any:user2');
    const count = await repo.getLikeCountByCommentId('any');
    expect(count).toBe(2);
  });

  it('should check if comment liked by user', async () => {
    pool.stateLike.clear();
    pool.stateLike.add('liked_comment:user');
    expect(await repo.isCommentLikedByUser('liked_comment', 'user')).toBe(true);
    expect(await repo.isCommentLikedByUser('not_liked_comment', 'user')).toBe(false);
  });
});
