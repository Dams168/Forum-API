import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DomainErrorTranslator from '../../../../Commons/exceptions/DomainErrorTranslator.js';

export default class CommentsController {
  constructor(container) {
    this._container = container;
    this.addComment = this.addComment.bind(this);
  }

  async addComment(req, res) {
    try {
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const payload = {
        ...req.body,
        owner: req.auth.id,
        threadId: req.params.threadId,
      };
      const addedComment = await addCommentUseCase.execute(payload);
      return res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
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
