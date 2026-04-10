import NewComment from '../../Domains/comments/entities/NewComment.js';
class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    // Validasi entity lebih dulu
    const newComment = new NewComment(useCasePayload);
    // Pastikan thread ada setelah payload valid
    await this._threadRepository.getThreadRowById(useCasePayload.threadId);
    return this._commentRepository.addComment(newComment);
  }
}

export default AddCommentUseCase;
