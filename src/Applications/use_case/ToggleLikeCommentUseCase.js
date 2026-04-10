class ToggleLikeCommentUseCase {
  constructor({ likeRepository, commentRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ threadId, commentId, userId }) {
    // Pastikan comment ada
    await this._commentRepository.verifyCommentExists(commentId, threadId);
    // Toggle like/unlike
    const result = await this._likeRepository.toggleLikeComment(commentId, userId);
    return result;
  }
}

export default ToggleLikeCommentUseCase;
