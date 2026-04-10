import { describe, it, expect, vi } from 'vitest';
import RefreshAuthenticationUseCase from '../RefreshAuthenticationUseCase.js';

describe('RefreshAuthenticationUseCase', () => {
  it('should orchestrate refresh token correctly', async () => {
    // Arrange
    const useCasePayload = { refreshToken: 'refresh-token' };
    const fakeId = 'user-123';
    const fakeAccessToken = 'access-token';

    const mockAuthenticationRepository = {
      checkAvailabilityToken: vi.fn().mockResolvedValue(),
    };
    const mockTokenManager = {
      verifyRefreshToken: vi.fn().mockResolvedValue({ id: fakeId }),
      createAccessToken: vi.fn().mockResolvedValue(fakeAccessToken),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      tokenManager: mockTokenManager,
    });

    // Action
    const result = await useCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith('refresh-token');
    expect(mockTokenManager.verifyRefreshToken).toBeCalledWith('refresh-token');
    expect(mockTokenManager.createAccessToken).toBeCalledWith({ id: fakeId });
    expect(result).toEqual({ accessToken: fakeAccessToken });
  });
});
