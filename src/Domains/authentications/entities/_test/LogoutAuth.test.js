import { describe, it, expect } from 'vitest';
import LogoutAuth from '../LogoutAuth.js';

describe('LogoutAuth entity', () => {
  it('should create LogoutAuth object correctly', () => {
    const payload = { refreshToken: 'refresh_token' };
    const auth = new LogoutAuth(payload);
    expect(auth.refreshToken).toEqual(payload.refreshToken);
  });

  it('should throw error if missing refreshToken', () => {
    expect(() => new LogoutAuth({})).toThrowError('LOGOUT_AUTH.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if refreshToken not string', () => {
    expect(() => new LogoutAuth({ refreshToken: 123 })).toThrowError('LOGOUT_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
