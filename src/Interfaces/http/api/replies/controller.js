import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';
import DomainErrorTranslator from '../../../../Commons/exceptions/DomainErrorTranslator.js';

export default class RepliesController {
  constructor(container) {
    this._container = container;
    this.addReply = this.addReply.bind(this);
  }

  async addReply(req, res) {
    try {
      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
      const useCasePayload = {
        content: req.body.content,
      };
      const useCaseParams = {
        threadId: req.params.threadId,
        commentId: req.params.commentId,
      };
      const owner = req.auth.id;
      const addedReply = await addReplyUseCase.execute(useCasePayload, useCaseParams, owner);
      return res.status(201).json({
        status: 'success',
        data: {
          addedReply,
        },
      });
    } catch (error) {
      const domainError = DomainErrorTranslator.translate(error);
      return res.status(domainError.statusCode).json({
        status: 'fail',
        message: domainError.message,
      });
    }
  }

  async deleteReply(req, res) {
    try {
      const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
      const useCaseParams = {
        threadId: req.params.threadId,
        commentId: req.params.commentId,
        replyId: req.params.replyId,
      };
      const owner = req.auth.id;
      await deleteReplyUseCase.execute(owner, useCaseParams);
      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      const domainError = DomainErrorTranslator.translate(error);
      return res.status(domainError.statusCode).json({
        status: 'fail',
        message: domainError.message,
      });
    }
  }
}
