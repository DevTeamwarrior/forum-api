import { describe, it, expect, vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase (unit)', () => {
  it('should orchestrate add thread using mock repository', async () => {
    const threadRepository = {
      addThread: vi.fn(async (payload) => ({ id: 'thread-123', ...payload })),
    };
    const useCase = new AddThreadUseCase({ threadRepository });
    const payload = { title: 'Judul', body: 'Isi', owner: 'user-1' };
    const result = await useCase.execute(payload);
    expect(threadRepository.addThread).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: 'thread-123', ...payload });
  });
});
