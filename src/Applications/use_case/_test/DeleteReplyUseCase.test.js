
import { vi, describe, it, expect } from 'vitest';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const payload = {
      replyId: 'reply-123',
      owner: 'user-123',
    };
    const mockReplyRepository = {
      deleteReply: vi.fn().mockResolvedValue(),
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({ replyRepository: mockReplyRepository });

    // Act
    await deleteReplyUseCase.execute(payload);

    // Assert
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(payload.replyId, payload.owner);
  });
});
