import RegisteredThread from '../../Domains/threads/entities/RegisteredThread.js';
import NewThread from '../../Domains/threads/entities/NewThread.js';
import ThreadRepository from '../../Domains/threads/ThreadRepository.js';

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThreadPayload) {
    const newThread = new NewThread(newThreadPayload);
    const id = `thread_${this._idGenerator()}`;
    const { title, body, owner } = newThread;
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO threads (id, title, body, owner, date) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, body, owner',
      values: [id, title, body, owner, date],
    };
    const result = await this._pool.query(query);
    return new RegisteredThread({ ...result.rows[0] });
  }

  // Ambil data thread mentah (tanpa mapping entity)
  async getThreadRowById(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
      throw new NotFoundError('thread tidak ditemukan');
    }
    return result.rows[0];
  }

  // Ambil data user (username) pemilik thread
  async getThreadOwnerUsername(ownerId) {
    const query = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [ownerId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
      throw new NotFoundError('user tidak ditemukan');
    }
    return result.rows[0].username;
  }

  // Ambil data comment mentah untuk thread tertentu (join ke users untuk username)
  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, c.content, c.date, c.is_delete, u.username
             FROM comments c
             JOIN users u ON c.owner = u.id
             WHERE c.thread_id = $1
             ORDER BY c.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  // Ambil data reply mentah untuk sekumpulan commentId (join ke users untuk username)
  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];
    const query = {
      text: `SELECT r.id, r.comment_id, r.content, r.date, r.is_delete, u.username
             FROM replies r
             JOIN users u ON r.owner = u.id
             WHERE r.comment_id = ANY($1::varchar[])
             ORDER BY r.date ASC`,
      values: [commentIds],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  // getThreadDetailById dihapus, orkestrasi pindah ke Use Case
}

export default ThreadRepositoryPostgres;
