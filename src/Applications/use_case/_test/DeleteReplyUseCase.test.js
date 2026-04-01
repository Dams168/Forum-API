import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import threadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    // creating dependency of use case
    const mockThreadRepository = new threadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = vi
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.checkAvailabilityComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.checkAvailabilityReply = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = vi.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = vi.fn().mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    await deleteReplyUseCase.execute(userId, useCaseParams);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.checkAvailabilityComment).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    expect(mockReplyRepository.checkAvailabilityReply).toHaveBeenCalledWith(
      useCaseParams.replyId,
      useCaseParams.commentId,
    );
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      useCaseParams.replyId,
      userId,
    );
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(useCaseParams.replyId);
  });
});
