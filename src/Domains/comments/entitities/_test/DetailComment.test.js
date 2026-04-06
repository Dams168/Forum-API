import DetailComment from '../DetailComment.js';

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw error when replies is not an array', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      replies: {},
      isDeleted: false,
    };

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.REPLIES_NOT_ARRAY');
  });

  it('should throw error when isDeleted is not a boolean', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      replies: [],
      isDeleted: 'true',
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw error when likeCount is not a number', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      replies: [],
      likeCount: '1',
      isDeleted: false,
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      replies: [],
      isDeleted: false,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toBe(payload.id);
    expect(detailComment.content).toBe(payload.content);
    expect(detailComment.date).toBe(payload.date);
    expect(detailComment.username).toBe(payload.username);
    expect(detailComment.replies).toEqual([]);
    expect(detailComment.likeCount).toBe(0);
  });

  it('should create DetailComment object with likeCount correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      replies: [],
      likeCount: 2,
      isDeleted: false,
    };

    const detailComment = new DetailComment(payload);

    expect(detailComment.likeCount).toBe(2);
  });

  it('should mask content when comment deleted', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      replies: [],
      isDeleted: true,
    };

    const detailComment = new DetailComment(payload);

    expect(detailComment.content).toBe('**komentar telah dihapus**');
  });
});
