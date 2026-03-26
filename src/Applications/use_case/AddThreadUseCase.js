import AddThread from '../../Domains/threads/entities/AddThread.js';

export default class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread);
  }
}
