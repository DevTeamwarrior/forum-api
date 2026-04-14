import { describe, it, expect, beforeEach } from 'vitest';
import LikeRepository from '../LikeRepository.js';

describe('LikeRepository abstract class', () => {
  let repo;
  beforeEach(() => {
    repo = new LikeRepository();
  });

  it('should throw error when calling toggleLikeComment', async () => {
    await expect(repo.toggleLikeComment('comment', 'user')).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when calling getLikeCountByCommentId', async () => {
    await expect(repo.getLikeCountByCommentId('comment')).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when calling isCommentLikedByUser', async () => {
    await expect(repo.isCommentLikedByUser('comment', 'user')).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
