import { describe, it, expect } from 'vitest';
import NewReply from '../NewReply.js';

describe('NewReply entity', () => {
  it('should create NewReply correctly', () => {
    const payload = { content: 'isi', commentId: 'comment-1', owner: 'user-1' };
    const reply = new NewReply(payload);
    expect(reply.content).toBe(payload.content);
    expect(reply.commentId).toBe(payload.commentId);
    expect(reply.owner).toBe(payload.owner);
  });

  it('should throw error if missing property', () => {
    expect(() => new NewReply({})).toThrow('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if wrong type', () => {
    const payload = { content: 123, commentId: 'comment-1', owner: 'user-1' };
    expect(() => new NewReply(payload)).toThrow('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
