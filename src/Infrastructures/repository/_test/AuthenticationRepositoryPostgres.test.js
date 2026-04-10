import { describe, it, expect, afterEach } from 'vitest';
import AuthenticationRepositoryPostgres from '../AuthenticationRepositoryPostgres.js';
import pool from '../../database/postgres/pool.js';

const testToken = 'test-refresh-token';

describe('AuthenticationRepositoryPostgres', () => {
  const repo = new AuthenticationRepositoryPostgres(pool);

  afterEach(async () => {
    await pool.query('DELETE FROM authentications WHERE token = $1', [testToken]);
  });

  it('should add and find token', async () => {
    await repo.addToken(testToken);
    await expect(repo.checkAvailabilityToken(testToken)).resolves.toBeUndefined();
  });

  it('should throw error if token not found', async () => {
    await expect(repo.checkAvailabilityToken('not-exist')).rejects.toThrowError('AUTHENTICATION_REPOSITORY.TOKEN_NOT_FOUND');
  });

  it('should delete token', async () => {
    await repo.addToken(testToken);
    await repo.deleteToken(testToken);
    await expect(repo.checkAvailabilityToken(testToken)).rejects.toThrowError('AUTHENTICATION_REPOSITORY.TOKEN_NOT_FOUND');
  });
});
