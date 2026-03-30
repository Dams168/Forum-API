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
    };

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.REPLIES_NOT_ARRAY');
  });

  it('should create DetailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      replies: [],
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toBe(payload.id);
    expect(detailComment.content).toBe(payload.content);
    expect(detailComment.date).toBe(payload.date);
    expect(detailComment.username).toBe(payload.username);
    expect(detailComment.replies).toEqual([]);
  });
});
