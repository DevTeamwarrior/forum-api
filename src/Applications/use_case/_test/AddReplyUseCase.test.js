

import { vi, describe, it, expect } from 'vitest';
import AddReplyUseCase from '../AddReplyUseCase.js';
import RegisteredReply from '../../../Domains/replies/entities/RegisteredReply.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange

    const useCasePayload = {
      content: 'sebuah balasan',
      commentId: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Gunakan nilai hardcoded berbeda untuk mock RegisteredReply
    const expectedAddedReply = new RegisteredReply({
      id: 'reply-123',
      content: 'Balasan dari Repo',
      owner: 'user-123',
    });

    const mockReplyRepository = {
      addReply: vi.fn().mockResolvedValue(expectedAddedReply),
    };
    const addReplyUseCase = new AddReplyUseCase({ replyRepository: mockReplyRepository });

    // Act

    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert

    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(useCasePayload);
    expect(addedReply).toStrictEqual(new RegisteredReply({
      id: 'reply-123',
      content: 'Balasan dari Repo',
      owner: 'user-123',
    }));
  });
});
