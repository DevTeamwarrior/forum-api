import { describe, it, expect } from 'vitest';
import RefreshAuth from '../RefreshAuth.js';

describe('RefreshAuth entity', () => {
  it('should create RefreshAuth object correctly', () => {
    const payload = { refreshToken: 'refresh_token' };
    const auth = new RefreshAuth(payload);
    expect(auth.refreshToken).toEqual(payload.refreshToken);
  });

  it('should throw error if missing refreshToken', () => {
    expect(() => new RefreshAuth({})).toThrowError('REFRESH_AUTH.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if refreshToken not string', () => {
    expect(() => new RefreshAuth({ refreshToken: 123 })).toThrowError('REFRESH_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
