import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, nanoid) {
    super();
    this._pool = pool;
    this._nanoid = nanoid;
  }

  async toggleLikeComment(commentId, userId) {
    const checkQuery = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(checkQuery);
    if (result.rowCount > 0) {
      // Unlike (delete)
      const deleteQuery = {
        text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
        values: [commentId, userId],
      };
      await this._pool.query(deleteQuery);
      return { liked: false };
    } else {
      // Like (insert)
      const id = `like_${this._nanoid()}`;
      const insertQuery = {
        text: 'INSERT INTO comment_likes (id, comment_id, user_id) VALUES ($1, $2, $3)',
        values: [id, commentId, userId],
      };
      await this._pool.query(insertQuery);
      return { liked: true };
    }
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async isCommentLikedByUser(commentId, userId) {
    const query = {
      text: 'SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }
}

export default LikeRepositoryPostgres;
