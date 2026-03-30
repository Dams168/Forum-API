import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import GetDetailThreadUseCase from '../GetDetailThreadUseCase.js';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../../Domains/comments/entitities/DetailComment.js';

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
    };

    const mockComments = [
      {
        id: 'comment-123',
        content: 'sebuah comment',
        date: '2021-08-08T07:19:09.775Z',
        username: 'john_doe',
        isDeleted: false,
      },
      {
        id: 'comment-124',
        content: 'sebuah comment',
        date: '2021-08-08T07:19:09.775Z',
        username: 'john_doe',
        isDeleted: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute('thread-123');

    // Assert
    expect(detailThread).toStrictEqual(
      new DetailThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'john_doe',
        comments: [
          new DetailComment({
            id: 'comment-123',
            content: 'sebuah comment',
            date: '2021-08-08T07:19:09.775Z',
            username: 'john_doe',
          }),
          new DetailComment({
            id: 'comment-124',
            content: '**komentar telah dihapus**',
            date: '2021-08-08T07:19:09.775Z',
            username: 'john_doe',
          }),
        ],
      }),
    );

    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.getDetailThreadById).toHaveBeenCalledTimes(1);
  });
});
