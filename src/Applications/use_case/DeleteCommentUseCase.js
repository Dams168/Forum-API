export default class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCaseParams) {
    const { threadId, commentId } = useCaseParams;
    await this._threadRepository.verifyThreadById(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteCommentById(commentId);
  }
}
