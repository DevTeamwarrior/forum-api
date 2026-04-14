import { describe, it, expect } from 'vitest';
import DetailReply from '../DetailReply.js';

describe('DetailReply entity', () => {
  it('should create DetailReply correctly when not deleted', () => {
    const payload = {
      id: 'reply-1',
      username: 'user',
      date: '2024-01-01',
      content: 'isi',
      is_delete: false,
    };
    const reply = new DetailReply(payload);
    expect(reply.id).toBe(payload.id);
    expect(reply.username).toBe(payload.username);
    expect(reply.date).toBe(payload.date);
    expect(reply.content).toBe(payload.content);
  });

  it('should mask content if is_delete true', () => {
    const payload = {
      id: 'reply-2',
      username: 'user',
      date: '2024-01-01',
      content: 'isi',
      is_delete: true,
    };
    const reply = new DetailReply(payload);
    expect(reply.content).toBe('**balasan telah dihapus**');
  });

  it('should throw error if missing property', () => {
    expect(() => new DetailReply({})).toThrow('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if wrong type', () => {
    const payload = {
      id: 1,
      username: 'user',
      date: '2024-01-01',
      content: 'isi',
      is_delete: false,
    };
    expect(() => new DetailReply(payload)).toThrow('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
