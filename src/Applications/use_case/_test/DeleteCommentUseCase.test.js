import { vi, describe, it, expect } from 'vitest';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const payload = { commentId: 'comment-123', owner: 'user-123' };
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentOwner = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = vi.fn()
      .mockImplementation(() => Promise.resolve(payload.commentId));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const deletedCommentId = await deleteCommentUseCase.execute(payload);

    // Assert
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(payload.commentId, payload.owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(payload.commentId, payload.owner);
    expect(deletedCommentId).toEqual(payload.commentId);
  });
});
