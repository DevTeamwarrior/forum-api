import { describe, it, expect } from 'vitest';
import RegisteredThread from '../RegisteredThread.js';

describe('a RegisteredThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Judul thread',
      body: 'Isi thread',
      // id or owner missing
    };
    // Action and Assert
    expect(() => new RegisteredThread(payload)).toThrowError('REGISTERED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: [],
      body: {},
      owner: false,
    };
    // Action and Assert
    expect(() => new RegisteredThread(payload)).toThrowError('REGISTERED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registeredThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Judul thread',
      body: 'Isi thread',
      owner: 'user-123',
    };
    // Action
    const { id, title, body, owner } = new RegisteredThread(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
