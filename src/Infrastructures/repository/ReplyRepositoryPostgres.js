import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import NewReply from '../../Domains/replies/entities/NewReply.js';
import RegisteredReply from '../../Domains/replies/entities/RegisteredReply.js';
import DetailReply from '../../Domains/replies/entities/DetailReply.js';
import InvariantError from '../../Commons/exceptions/InvariantError.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReplyPayload) {
    const newReply = new NewReply(newReplyPayload);
    const id = `reply-${this._idGenerator()}`;
    const { content, commentId, owner } = newReply;

    // Validasi comment dan thread
    // Ambil comment dan thread_id dari comment
    const NotFoundError = (await import('../../Commons/exceptions/NotFoundError.js')).default;
    const commentQuery = {
      text: 'SELECT id, thread_id FROM comments WHERE id = $1',
      values: [commentId],
    };
    const commentResult = await this._pool.query(commentQuery);
    if (!commentResult.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
    const threadIdFromComment = commentResult.rows[0].thread_id;
    // Validasi threadId dari URL harus sama dengan threadId pada comment
    if (newReplyPayload.threadId && threadIdFromComment !== newReplyPayload.threadId) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    // Validasi thread
    const threadQuery = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadIdFromComment],
    };
    const threadResult = await this._pool.query(threadQuery);
    if (!threadResult.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const query = {
      text: `INSERT INTO replies (id, content, comment_id, owner, date, is_delete)
             VALUES ($1, $2, $3, $4, NOW(), false)
             RETURNING id, content, owner` ,
      values: [id, content, commentId, owner],
    };
    const result = await this._pool.query(query);
    return new RegisteredReply({ ...result.rows[0] });
  }

  async deleteReply(replyId, owner) {
    await this.verifyReplyOwner(replyId, owner);
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };
    await this._pool.query(query);
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];
    const query = {
      text: `SELECT replies.id, replies.comment_id, users.username, replies.date, replies.content, replies.is_delete
             FROM replies
             JOIN users ON replies.owner = users.id
             WHERE replies.comment_id = ANY($1::varchar[])
             ORDER BY replies.date ASC`,
      values: [commentIds],
    };
    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      commentId: row.comment_id,
      reply: new DetailReply(row),
    }));
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('reply tidak ditemukan');
    }
    if (result.rows[0].owner !== owner) {
      throw new InvariantError('anda tidak berhak mengakses resource ini');
    }
  }
}

export default ReplyRepositoryPostgres;
