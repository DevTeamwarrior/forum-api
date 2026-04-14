import { describe, it, expect, vi } from 'vitest';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate toggle like/unlike correctly', async () => {
    const likeRepository = { toggleLikeComment: vi.fn(async () => ({ liked: true })) };
    const commentRepository = { verifyCommentExists: vi.fn(async () => true) };
    const useCase = new ToggleLikeCommentUseCase({ likeRepository, commentRepository });
    const payload = { threadId: 'thread-1', commentId: 'comment-1', userId: 'user-1' };
    const result = await useCase.execute(payload);
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-1', 'thread-1');
    expect(likeRepository.toggleLikeComment).toHaveBeenCalledWith('comment-1', 'user-1');
    expect(result).toEqual({ liked: true });
  });
});
