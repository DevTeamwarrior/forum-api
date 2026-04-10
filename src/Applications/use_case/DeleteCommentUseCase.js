class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute({ commentId, owner }) {
    // verifikasi kepemilikan komentar
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    // soft delete
    return this._commentRepository.deleteComment(commentId, owner);
  }
}

export default DeleteCommentUseCase;
