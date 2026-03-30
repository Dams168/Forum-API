import DetailComment from '../../Domains/comments/entitities/DetailComment.js';
import DetailThread from '../../Domains/threads/entities/DetailThread.js';

const DELETED_COMMENT_PLACEHOLDER = '**komentar telah dihapus**';
const THREAD_ID_NOT_PROVIDED_ERROR = 'GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID';

export default class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams) {
    const threadId = typeof useCaseParams === 'string' ? useCaseParams : useCaseParams?.threadId;

    if (!threadId) {
      throw new Error(THREAD_ID_NOT_PROVIDED_ERROR);
    }

    const thread = await this._threadRepository.getDetailThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const detailComments = comments.map((comment) => {
      const content = comment.isDeleted ? DELETED_COMMENT_PLACEHOLDER : comment.content;
      return new DetailComment({
        id: comment.id,
        content,
        date: comment.date,
        username: comment.username,
      });
    });

    return new DetailThread({ ...thread, comments: detailComments });
  }
}
