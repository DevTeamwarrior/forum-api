import { describe, it, expect } from 'vitest';
import NewComment from '../NewComment.js';

describe('NewComment entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new NewComment({})).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data type specification', () => {
    expect(() => new NewComment({ content: 123, thread_id: [], owner: {} })).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment entity correctly', () => {
    const payload = { content: 'komentar', thread_id: 'thread-123', owner: 'user-123' };
    const comment = new NewComment(payload);
    expect(comment.content).toEqual(payload.content);
    expect(comment.thread_id).toEqual(payload.thread_id);
    expect(comment.owner).toEqual(payload.owner);
  });
});
