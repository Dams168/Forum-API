import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import GetDetailThreadUseCase from '../GetDetailThreadUseCase.js';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../../Domains/comments/entitities/DetailComment.js';
import DetailReply from '../../../Domains/replies/entities/DetailReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';

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

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'sebuah reply',
        date: '2021-08-08T07:19:09.775Z',
        username: 'john_doe',
        isDeleted: false,
      },
      {
        id: 'reply-124',
        content: 'sebuah reply',
        date: '2021-08-08T07:19:09.775Z',
        username: 'john_doe',
        isDeleted: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = vi.fn().mockImplementation((commentId) => {
      if (commentId === 'comment-123') {
        return Promise.resolve(mockReplies);
      }

      return Promise.resolve([]);
    });

    /** creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
            replies: [
              new DetailReply({
                id: 'reply-123',
                content: 'sebuah reply',
                date: '2021-08-08T07:19:09.775Z',
                username: 'john_doe',
                isDelete: false,
              }),
              new DetailReply({
                id: 'reply-124',
                content: 'sebuah reply',
                date: '2021-08-08T07:19:09.775Z',
                username: 'john_doe',
                isDelete: true,
              }),
            ],
            isDeleted: false,
          }),
          new DetailComment({
            id: 'comment-124',
            content: 'sebuah comment',
            date: '2021-08-08T07:19:09.775Z',
            username: 'john_doe',
            replies: [],
            isDeleted: true,
          }),
        ],
      }),
    );

    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledTimes(1);
    expect(mockThreadRepository.getDetailThreadById).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-124');
    expect(mockReplyRepository.getRepliesByCommentId).toHaveBeenCalledTimes(2);
  });
});
