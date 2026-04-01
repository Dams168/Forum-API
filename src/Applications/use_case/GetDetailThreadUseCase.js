import DetailComment from '../../Domains/comments/entitities/DetailComment.js';
import DetailThread from '../../Domains/threads/entities/DetailThread.js';
import DetailReply from '../../Domains/replies/entities/DetailReply.js';

export default class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getDetailThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const detailedComments = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
        const detailReplies = replies.map(
          (reply) =>
            new DetailReply({
              id: reply.id,
              content: reply.content,
              date: reply.date,
              username: reply.username,
              isDelete: reply.isDeleted,
            }),
        );

        return new DetailComment({
          id: comment.id,
          content: comment.content,
          date: comment.date,
          username: comment.username,
          replies: detailReplies,
          isDeleted: comment.isDeleted,
        });
      }),
    );

    return new DetailThread({ ...thread, comments: detailedComments });
  }
}
