export default class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCaseParams) {
    const { threadId, commentId, replyId } = useCaseParams;

    await this._threadRepository.verifyThreadById(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId, threadId);
    await this._replyRepository.checkAvailabilityReply(replyId, commentId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    return this._replyRepository.deleteReplyById(replyId);
  }
}
