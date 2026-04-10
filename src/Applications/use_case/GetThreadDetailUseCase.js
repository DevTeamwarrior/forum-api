

import DetailThread from '../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../Domains/threads/entities/DetailComment.js';
import DetailReply from '../../Domains/replies/entities/DetailReply.js';


class GetThreadDetailUseCase {
  constructor({ threadRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    // Ambil data thread mentah
    const threadRow = await this._threadRepository.getThreadRowById(threadId);
    // Ambil username owner
    const username = await this._threadRepository.getThreadOwnerUsername(threadRow.owner);
    // Pastikan date string ISO
    const date = threadRow.date instanceof Date ? threadRow.date.toISOString() : threadRow.date;

    // Ambil comments mentah
    const commentRows = await this._threadRepository.getCommentsByThreadId(threadId);
    // Ambil replies mentah
    const commentIds = commentRows.map((row) => row.id);
    const replyRows = await this._threadRepository.getRepliesByCommentIds(commentIds);

    // Ambil likeCount untuk setiap komentar
    const likeCounts = {};
    for (const commentId of commentIds) {
      likeCounts[commentId] = await this._likeRepository.getLikeCountByCommentId(commentId);
    }


    // Group replies by comment_id
    const repliesByComment = {};
    for (const row of replyRows) {
      const reply = new DetailReply({
        ...row,
        date: row.date instanceof Date ? row.date.toISOString() : row.date,
        is_delete: typeof row.is_delete === 'boolean' ? row.is_delete : Boolean(row.is_delete),
      });
      if (!repliesByComment[row.comment_id]) repliesByComment[row.comment_id] = [];
      repliesByComment[row.comment_id].push(reply);
    }

    // Map comments beserta replies dan likeCount
    const comments = commentRows.map((row) => {
      const username = row.username || row.owner || 'unknown';
      const comment = new DetailComment({
        ...row,
        username,
        date: row.date instanceof Date ? row.date.toISOString() : row.date,
        is_delete: typeof row.is_delete === 'boolean' ? row.is_delete : Boolean(row.is_delete),
        likeCount: likeCounts[row.id] || 0,
      });
      comment.replies = repliesByComment[comment.id] || [];
      return comment;
    });

    // Bangun payload DetailThread
    return new DetailThread({
      id: threadRow.id,
      title: threadRow.title,
      body: threadRow.body,
      date,
      username,
      comments,
    });
  }
}

export default GetThreadDetailUseCase;
