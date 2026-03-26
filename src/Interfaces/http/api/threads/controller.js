import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';

export default class ThreadsController {
  constructor(container) {
    this._container = container;

    this.postThreadController = this.postThreadController.bind(this);
  }

  async postThreadController(req, res, next) {
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
      next(error);
    }
  }
}
