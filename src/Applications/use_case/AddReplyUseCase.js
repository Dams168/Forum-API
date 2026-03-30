import AddReply from '../../Domains/replies/entities/AddReply.js';

export default class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseParams, owner) {
    const { threadId, commentId } = useCaseParams;
    await this._threadRepository.verifyThreadById(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId, threadId);

    const addReply = new AddReply({
      content: useCasePayload.content,
    });

    return this._replyRepository.addReply(addReply, owner, commentId);
  }
}
