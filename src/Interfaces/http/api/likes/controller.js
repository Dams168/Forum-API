import LikeUnlikeCommentUseCase from '../../../../Applications/use_case/LikeUnlikeCommentUseCase.js';
import DomainErrorTranslator from '../../../../Commons/exceptions/DomainErrorTranslator.js';

export default class LikesController {
  constructor(container) {
    this._container = container;
    this.likeUnlikeComment = this.likeUnlikeComment.bind(this);
  }

  async likeUnlikeComment(req, res) {
    try {
      const likeUnlikeCommentUseCase = this._container.getInstance(LikeUnlikeCommentUseCase.name);
      const payload = {
        ...req.body,
        userId: req.auth.id,
        threadId: req.params.threadId,
        commentId: req.params.commentId,
      };
      await likeUnlikeCommentUseCase.execute(payload);
      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      const translatedError = DomainErrorTranslator.translate(error);
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }
  }
}
