
import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import DomainErrorTranslator from '../../../../Commons/exceptions/DomainErrorTranslator.js';

class CommentsController {
  constructor(container) {
    this._container = container;
    this.postComment = this.postComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  async postComment(req, res) {
    try {
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const addedComment = await addCommentUseCase.execute({
        ...req.body,
        threadId: req.params.threadId, // gunakan camelCase agar konsisten dengan use case
        owner: req.auth.credentials.id,
      });
      res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      // Tambahkan log error untuk tracking
      console.error('[CommentsController][postComment] Error:', error);
      // Log semua properti error
      if (error && typeof error === 'object') {
        for (const key of Object.keys(error)) {
          console.error(`[ErrorProp] ${key}:`, error[key]);
        }
      }
      const translatedError = DomainErrorTranslator.translate(error);
      if (translatedError.statusCode) {
        res.status(translatedError.statusCode).json({
          status: 'fail',
          message: translatedError.message,
        });
      } else {
        // fallback error
        res.status(500).json({
          status: 'error',
          message: 'terjadi kegagalan pada server kami',
        });
      }
    }
  }

  async deleteComment(req, res) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute({
      commentId: req.params.commentId,
      owner: req.auth.credentials.id,
    });
    res.status(200).json({
      status: 'success',
    });
  }

}

export default CommentsController;
