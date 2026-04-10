import ToggleLikeCommentUseCase from '../../../../Applications/use_case/ToggleLikeCommentUseCase.js';

class LikeController {
  constructor(container) {
    this._container = container;
    this.toggleLikeComment = this.toggleLikeComment.bind(this);
  }

  async toggleLikeComment(req, res) {
    const { threadId, commentId } = req.params;
    const userId = req.auth.credentials.id;
    const toggleLikeCommentUseCase = this._container.getInstance(ToggleLikeCommentUseCase.name);
    await toggleLikeCommentUseCase.execute({ threadId, commentId, userId });
    res.status(200).json({ status: 'success' });
  }
}

export default LikeController;
