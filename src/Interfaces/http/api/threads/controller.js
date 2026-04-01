import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetDetailThreadUseCase from '../../../../Applications/use_case/GetDetailThreadUseCase.js';
import DomainErrorTranslator from '../../../../Commons/exceptions/DomainErrorTranslator.js';

export default class ThreadsController {
  constructor(container) {
    this._container = container;

    this.postThreadController = this.postThreadController.bind(this);
    this.getDetailThreadController = this.getDetailThreadController.bind(this);
  }

  async postThreadController(req, res) {
    try {
      const { id: owner } = req.auth;
      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);

      const addedThread = await addThreadUseCase.execute({
        ...req.body,
        owner,
      });

      res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      const translatedError = DomainErrorTranslator.translate(error);
      res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }
  }

  async getDetailThreadController(req, res) {
    try {
      const { threadId } = req.params;
      const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);

      const detailThread = await getDetailThreadUseCase.execute(threadId);

      res.status(200).json({
        status: 'success',
        data: {
          thread: detailThread,
        },
      });
    } catch (error) {
      const translatedError = DomainErrorTranslator.translate(error);
      res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }
  }
}
