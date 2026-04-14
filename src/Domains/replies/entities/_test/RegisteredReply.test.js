import { describe, it, expect } from 'vitest';
import RegisteredReply from '../RegisteredReply.js';

describe('RegisteredReply entity', () => {
  it('should create RegisteredReply correctly', () => {
    const payload = { id: 'reply-1', content: 'isi', owner: 'user-1' };
    const reply = new RegisteredReply(payload);
    expect(reply.id).toBe(payload.id);
    expect(reply.content).toBe(payload.content);
    expect(reply.owner).toBe(payload.owner);
  });

  it('should throw error if missing property', () => {
    expect(() => new RegisteredReply({})).toThrow('REGISTERED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if wrong type', () => {
    const payload = { id: 123, content: 'isi', owner: 'user-1' };
    expect(() => new RegisteredReply(payload)).toThrow('REGISTERED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
