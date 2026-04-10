import { describe, it, expect } from 'vitest';
import TokenManager from '../TokenManager.js';

const secret = 'test-secret';
const refreshSecret = 'test-refresh-secret';
const payload = { id: 'user-123' };

describe('TokenManager', () => {
  const manager = new TokenManager(secret, refreshSecret);

  it('should create and verify access token', async () => {
    const token = await manager.createAccessToken(payload);
    const decoded = await manager.verifyAccessToken(token);
    expect(decoded.id).toEqual(payload.id);
  });

  it('should create and verify refresh token', async () => {
    const token = await manager.createRefreshToken(payload);
    const decoded = await manager.verifyRefreshToken(token);
    expect(decoded.id).toEqual(payload.id);
  });

  it('should throw error for invalid access token', async () => {
    await expect(manager.verifyAccessToken('invalid')).rejects.toThrowError('TOKEN_MANAGER.INVALID_ACCESS_TOKEN');
  });

  it('should throw error for invalid refresh token', async () => {
    await expect(manager.verifyRefreshToken('invalid')).rejects.toThrowError('TOKEN_MANAGER.INVALID_REFRESH_TOKEN');
  });
});
