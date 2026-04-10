import RegisteredComment from '../../Domains/comments/entities/RegisteredComment.js';
import NewComment from '../../Domains/comments/entities/NewComment.js';
import CommentRepository from '../../Domains/comments/CommentRepository.js';

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

    async verifyCommentExists(commentId, threadId) {
    // Pastikan comment dan thread sesuai
    const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
    const commentQuery = {
      text: 'SELECT id, thread_id FROM comments WHERE id = $1',
      values: [commentId],
    };
    const commentResult = await this._pool.query(commentQuery);
    if (!commentResult.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
    const comment = commentResult.rows[0];
    if (comment.thread_id !== threadId) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async addComment(newCommentPayload) {
    const newComment = new NewComment(newCommentPayload);
    // Cek thread exist
    const threadQuery = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [newComment.thread_id],
    };
    const threadResult = await this._pool.query(threadQuery);
    if (!threadResult.rowCount) {
      const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
      throw new NotFoundError('thread tidak ditemukan');
    }
    const id = `comment_${this._idGenerator()}`;
    const { content, thread_id, owner } = newComment;
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, owner, date, is_delete) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, thread_id, owner, date, false],
    };
    const result = await this._pool.query(query);
    return new RegisteredComment({ ...result.rows[0] });
  }

  async deleteComment(commentId, owner) {
    // Cek apakah komentar ada
    const commentQuery = {
      text: 'SELECT id, owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const commentResult = await this._pool.query(commentQuery);
    if (!commentResult.rowCount) {
      const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
      throw new NotFoundError('komentar tidak ditemukan');
    }
    const comment = commentResult.rows[0];
    if (comment.owner !== owner) {
      const ForbiddenError = (await import('../../Commons/exceptions/ForbiddenError.js')).default;
      throw new ForbiddenError('anda tidak berhak menghapus komentar ini');
    }
    // Soft delete
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
      throw new NotFoundError('komentar tidak ditemukan atau sudah dihapus');
    }
    return result.rows[0].id;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT id, content, owner, date, is_delete FROM comments WHERE thread_id = $1 ORDER BY date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT id, owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
      throw new NotFoundError('komentar tidak ditemukan');
    }
    const comment = result.rows[0];
    if (comment.owner !== owner) {
      const ForbiddenError = (await import('../../Commons/exceptions/ForbiddenError.js')).default;
      throw new ForbiddenError('anda tidak berhak menghapus komentar ini');
    }
  }
}

export default CommentRepositoryPostgres;
