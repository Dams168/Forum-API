import AddReply from '../../../Domains/replies/entities/AddReply.js';
import AddReplyUseCase from '../AddReplyUseCase.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah balasan',
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const owner = 'user-123';

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner,
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const getReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.execute(useCasePayload, useCaseParams, owner);

    // Assert
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner,
      }),
    );

    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: useCasePayload.content,
      }),
      owner,
      useCaseParams.commentId,
    );
  });
});
