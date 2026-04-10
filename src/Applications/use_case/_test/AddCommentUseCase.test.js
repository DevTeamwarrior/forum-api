import { vi, describe, it, expect } from 'vitest';
import AddCommentUseCase from '../AddCommentUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import RegisteredComment from '../../../Domains/comments/entities/RegisteredComment.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'komentar',
      thread_id: 'thread-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };
    const mockRegisteredComment = new RegisteredComment({
      id: 'comment-123',
      content: 'Komentar dari Repo',
      owner: 'user-123',
    });
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = vi.fn()
      .mockImplementation(() => Promise.resolve(mockRegisteredComment));
    // Tambahkan mock threadRepository
    const mockThreadRepository = { getThreadRowById: vi.fn().mockResolvedValue(true) };
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    // Action
    const registeredComment = await addCommentUseCase.execute(useCasePayload);
    // Assert
    expect(registeredComment).toStrictEqual(new RegisteredComment({
      id: 'comment-123',
      content: 'Komentar dari Repo',
      owner: 'user-123',
    }));
    expect(mockCommentRepository.addComment).toBeCalledWith(new NewComment(useCasePayload));
    expect(mockThreadRepository.getThreadRowById).toBeCalledWith(useCasePayload.thread_id);
  });

  it('should throw ClientError when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'komentar',
      thread_id: 'thread-not-exist',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.addComment = vi.fn();
    const mockThreadRepository = { getThreadRowById: vi.fn().mockRejectedValue(new Error('thread tidak ditemukan')) };
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    // Action & Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects.toThrowError('thread tidak ditemukan');
  });
});
