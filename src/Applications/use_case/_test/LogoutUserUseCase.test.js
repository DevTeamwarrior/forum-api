import { describe, it, expect, vi } from 'vitest';
import LogoutUserUseCase from '../LogoutUserUseCase.js';

describe('LogoutUserUseCase', () => {
  it('should orchestrate logout correctly', async () => {
    // Arrange
    const useCasePayload = { refreshToken: 'refresh-token' };
    const mockAuthenticationRepository = {
      deleteToken: vi.fn().mockResolvedValue(),
    };
    const useCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthenticationRepository,
    });

    // Action
    await useCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationRepository.deleteToken).toBeCalledWith('refresh-token');
  });
});
