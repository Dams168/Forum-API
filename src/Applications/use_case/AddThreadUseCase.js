import AddThread from '../../Domains/threads/entities/AddThread.js';

export default class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { owner } = useCasePayload;
    const addThread = new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    });

    return this._threadRepository.addThread(addThread, owner);
  }
}
