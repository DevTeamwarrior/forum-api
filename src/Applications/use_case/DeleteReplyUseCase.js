class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute({ replyId, owner }) {
    await this._replyRepository.deleteReply(replyId, owner);
  }
}

export default DeleteReplyUseCase;
