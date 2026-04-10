import { describe, it, expect } from 'vitest';
import DetailThread from '../DetailThread.js';
import DetailComment from '../DetailComment.js';

describe('DetailThread entity', () => {
  it('should create DetailThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: '2021-01-01T00:00:00.000Z',
      username: 'user',
      comments: [
        new DetailComment({
          id: 'comment-1',
          username: 'user',
          date: '2021-01-01T01:00:00.000Z',
          content: 'komentar',
          is_delete: false,
        }),
      ],
    };
    const thread = new DetailThread(payload);
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0]).toBeInstanceOf(DetailComment);
  });

  it('should throw error if payload not contain needed property', () => {
    expect(() => new DetailThread({})).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
