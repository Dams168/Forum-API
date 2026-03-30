import DetailComment from '../../Domains/comments/entitities/DetailComment.js';
import DetailThread from '../../Domains/threads/entities/DetailThread.js';
import DetailReply from '../../Domains/replies/entities/DetailReply.js';

const DELETED_COMMENT_PLACEHOLDER = '**komentar telah dihapus**';
const THREAD_ID_NOT_PROVIDED_ERROR = 'GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID';

export default class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const threadId = typeof useCaseParams === 'string' ? useCaseParams : useCaseParams?.threadId;

    if (!threadId) {
      throw new Error(THREAD_ID_NOT_PROVIDED_ERROR);
    }

    const thread = await this._threadRepository.getDetailThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const detailedComments = await Promise.all(
      comments.map(async (comment) => {
        const content = comment.isDeleted ? DELETED_COMMENT_PLACEHOLDER : comment.content;
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
          content,
          date: comment.date,
          username: comment.username,
          replies: detailReplies,
        });
      }),
    );

    return new DetailThread({ ...thread, comments: detailedComments });
  }
}
