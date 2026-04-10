
import { vi, describe, it, expect } from 'vitest';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../../Domains/threads/entities/DetailComment.js';
import DetailReply from '../../../Domains/replies/entities/DetailReply.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const threadRow = {
      id: threadId,
      title: 'sebuah thread',
      body: 'isi thread',
      date: '2024-03-25T00:00:00.000Z',
      owner: 'user-1',
    };
    const username = 'dicoding';
    const commentRows = [
      { id: 'comment-1', username: 'userA', date: '2024-03-25T01:00:00.000Z', content: 'komentar', is_delete: false, thread_id: threadId, owner: 'userA' },
    ];
    const replyRows = [
      { id: 'reply-1', comment_id: 'comment-1', username: 'userB', date: '2024-03-25T02:00:00.000Z', content: 'balasan', is_delete: false, owner: 'userB' },
    ];
    const mockThreadRepository = {
      getThreadRowById: vi.fn().mockResolvedValue(threadRow),
      getThreadOwnerUsername: vi.fn().mockResolvedValue(username),
      getCommentsByThreadId: vi.fn().mockResolvedValue(commentRows),
      getRepliesByCommentIds: vi.fn().mockResolvedValue(replyRows),
    };
    const mockLikeRepository = {
      getLikeCountByCommentId: vi.fn().mockResolvedValue(5),
    };
    const getThreadDetailUseCase = new GetThreadDetailUseCase({ threadRepository: mockThreadRepository, likeRepository: mockLikeRepository });

    // Act
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadRowById).toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getThreadOwnerUsername).toHaveBeenCalledWith(threadRow.owner);
    expect(mockThreadRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-1']);

    // Validate mapping
    expect(threadDetail).toBeInstanceOf(DetailThread);
    expect(threadDetail.id).toBe(threadId);
    expect(threadDetail.title).toBe('sebuah thread');
    expect(threadDetail.body).toBe('isi thread');
    expect(threadDetail.date).toBe('2024-03-25T00:00:00.000Z');
    expect(threadDetail.username).toBe('dicoding');
    expect(threadDetail.comments).toHaveLength(1);
    expect(threadDetail.comments[0]).toBeInstanceOf(DetailComment);
    expect(threadDetail.comments[0].id).toBe('comment-1');
    expect(threadDetail.comments[0].replies).toHaveLength(1);
    expect(threadDetail.comments[0].replies[0]).toBeInstanceOf(DetailReply);
    expect(threadDetail.comments[0].replies[0].id).toBe('reply-1');
    // Like count assertion
    expect(threadDetail.comments[0].likeCount).toBe(5);
  });
});
