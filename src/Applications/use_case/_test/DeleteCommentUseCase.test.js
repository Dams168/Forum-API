import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import threadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const userId = 'user-123';
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // creating dependency of use case
    const mockThreadRepository = new threadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadById = vi.fn().mockImplementation(() => Promise.resolve());

    mockCommentRepository.checkAvailabilityComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = vi.fn().mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    await deleteCommentUseCase.execute(userId, useCaseParams);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toHaveBeenCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      useCaseParams.commentId,
      userId,
    );
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(useCaseParams.commentId);
  });
});
