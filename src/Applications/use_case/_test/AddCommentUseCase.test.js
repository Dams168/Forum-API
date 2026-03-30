import AddCommentUseCase from '../AddCommentUseCase.js';
import AddComment from '../../../Domains/comments/entitities/AddComment.js';
import AddedComment from '../../../Domains/comments/entitities/AddedComment.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';

describe('a AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    );

    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
      }),
      useCasePayload.owner,
      useCasePayload.threadId,
    );
  });
});
