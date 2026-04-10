import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';

class RepliesController {
  constructor(container) {
    this._container = container;
    this.postReply = this.postReply.bind(this);
    this.deleteReply = this.deleteReply.bind(this);
  }

  async postReply(req, res) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      ...req.body,
      commentId: req.params.commentId,
      threadId: req.params.threadId,
      owner: req.auth.credentials.id,
    });
    res.status(201).json({
      status: 'success',
      data: {
        addedReply,
      },
    });
  }

  async deleteReply(req, res) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute({
      replyId: req.params.replyId,
      owner: req.auth.credentials.id,
    });
    res.status(200).json({
      status: 'success',
    });
  }
}

export default RepliesController;
