export default class LikeUnlikeCommentUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.checkAvailabilityThread(useCasePayload.threadId);
    await this._commentRepository.checkAvailabilityComment(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );

    const isLiked = await this._likeRepository.checkIfUserHasLikedComment(
      useCasePayload.commentId,
      useCasePayload.userId,
    );

    if (isLiked) {
      await this._likeRepository.unLikeComment(useCasePayload.commentId, useCasePayload.userId);
    } else {
      await this._likeRepository.addLikeComment(useCasePayload.commentId, useCasePayload.userId);
    }
  }
}
