/* eslint-disable no-irregular-whitespace */
import { describe, it, expect } from 'vitest';
import PasswordHash from '../PasswordHash.js';
 
describe('PasswordHash interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const passwordHash = new PasswordHash();
 
    // Action & Assert
    await expect(passwordHash.hash('dummy_password')).rejects.toThrowError('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
  });
});