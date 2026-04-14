
import { describe, it, expect, vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly (unit test, mock repository)', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Judul thread',
      body: 'Isi thread',
      owner: 'user-123',
    };
    const mockThread = {
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    };
    const threadRepository = {
      addThread: vi.fn(async (payload) => {
        expect(payload).toEqual(useCasePayload);
        return mockThread;
      }),
    };
    const addThreadUseCase = new AddThreadUseCase({ threadRepository });

    // Action
    const result = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(threadRepository.addThread).toHaveBeenCalledWith(useCasePayload);
    expect(result).toEqual(mockThread);
  });
});