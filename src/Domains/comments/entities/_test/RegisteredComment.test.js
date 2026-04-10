import { describe, it, expect } from 'vitest';
import RegisteredComment from '../RegisteredComment.js';

describe('RegisteredComment entity', () => {
  it('should throw error when not contain needed property', () => {
    expect(() => new RegisteredComment({})).toThrowError('REGISTERED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data type specification', () => {
    expect(() => new RegisteredComment({ id: 123, content: [], owner: {} })).toThrowError('REGISTERED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create RegisteredComment entity correctly', () => {
    const payload = { id: 'comment-123', content: 'komentar', owner: 'user-123' };
    const comment = new RegisteredComment(payload);
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.owner).toEqual(payload.owner);
  });
});
