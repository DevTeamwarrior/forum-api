import { describe, it, expect } from 'vitest';
import NewAuth from '../NewAuth.js';

describe('NewAuth entity', () => {
  it('should create NewAuth object correctly', () => {
    const payload = { refreshToken: 'refresh_token' };
    const auth = new NewAuth(payload);
    expect(auth.refreshToken).toEqual(payload.refreshToken);
  });

  it('should throw error if missing refreshToken', () => {
    expect(() => new NewAuth({})).toThrowError('NEW_AUTH.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if refreshToken not string', () => {
    expect(() => new NewAuth({ refreshToken: 123 })).toThrowError('NEW_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
