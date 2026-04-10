import { describe, it, expect, vi } from 'vitest';
import LoginUserUseCase from '../LoginUserUseCase.js';

describe('LoginUserUseCase', () => {
  it('should orchestrate login user correctly', async () => {
    // Arrange
    const useCasePayload = { username: 'user', password: 'pass' };
    const fakeId = 'user-123';
    const fakeAccessToken = 'access-token';
    const fakeRefreshToken = 'refresh-token';

    const mockUserRepository = {
      verifyUserCredential: vi.fn().mockResolvedValue(fakeId),
    };
    const mockPasswordHash = {
      hash: vi.fn(),
    };
    const mockTokenManager = {
      createAccessToken: vi.fn().mockResolvedValue(fakeAccessToken),
      createRefreshToken: vi.fn().mockResolvedValue(fakeRefreshToken),
    };
    const mockAuthenticationRepository = {
      addToken: vi.fn().mockResolvedValue(),
    };

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
      tokenManager: mockTokenManager,
      authenticationRepository: mockAuthenticationRepository,
    });

    // Action
    const result = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.verifyUserCredential).toBeCalledWith('user', 'pass', mockPasswordHash);
    expect(mockTokenManager.createAccessToken).toBeCalledWith({ id: fakeId });
    expect(mockTokenManager.createRefreshToken).toBeCalledWith({ id: fakeId });
    expect(mockAuthenticationRepository.addToken).toBeCalledWith(fakeRefreshToken);
    expect(result).toEqual({ accessToken: fakeAccessToken, refreshToken: fakeRefreshToken });
    // Verifikasi passwordHash tidak dipanggil (karena hanya diteruskan ke userRepository)
    expect(mockPasswordHash.hash).not.toBeCalled();
  });
});
