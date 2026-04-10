import { describe, it, expect } from 'vitest';
import AuthenticationRepository from '../AuthenticationRepository.js';

describe('AuthenticationRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const repo = new AuthenticationRepository();
    await expect(repo.addToken('token')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.checkAvailabilityToken('token')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repo.deleteToken('token')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
