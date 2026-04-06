import LikeUnlikeCommentUseCase from '../LikeUnlikeCommentUseCase.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('LikeUnlikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly and unlike comment not called', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkIfUserHasLikedComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLikeComment = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.unLikeComment = vi.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
    expect(mockLikeRepository.checkIfUserHasLikedComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.addLikeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.unLikeComment).not.toBeCalled();
  });

  it('should orchestrating the unlike comment action correctly and like comment not called', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailabilityThread = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkIfUserHasLikedComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.addLikeComment = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.unLikeComment = vi.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId,
    );
    expect(mockLikeRepository.checkIfUserHasLikedComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
    expect(mockLikeRepository.addLikeComment).not.toBeCalled();
    expect(mockLikeRepository.unLikeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.userId,
    );
  });
});
