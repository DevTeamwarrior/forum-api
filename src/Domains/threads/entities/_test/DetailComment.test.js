import { describe, it, expect } from 'vitest';
import DetailComment from '../DetailComment.js';

describe('DetailComment entity', () => {
  it('should create DetailComment object correctly', () => {
    const payload = {
      id: 'comment-1',
      username: 'user',
      date: '2021-01-01T01:00:00.000Z',
      content: 'komentar',
      is_delete: false,
    };
    const comment = new DetailComment(payload);
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(payload.content);
  });

  it('should show deleted message if is_delete true', () => {
    const payload = {
      id: 'comment-1',
      username: 'user',
      date: '2021-01-01T01:00:00.000Z',
      content: 'komentar',
      is_delete: true,
    };
    const comment = new DetailComment(payload);
    expect(comment.content).toEqual('**komentar telah dihapus**');
  });

  it('should throw error if payload not contain needed property', () => {
    expect(() => new DetailComment({})).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
