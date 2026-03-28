import AddComment from '../../Domains/comments/entitities/AddComment.js';

export default class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const addComment = new AddComment({
      content: useCasePayload.content,
    });

    await this._threadRepository.verifyThreadExists(useCasePayload.threadId);
    return this._commentRepository.addComment(
      addComment,
      useCasePayload.owner,
      useCasePayload.threadId,
    );
  }
}
