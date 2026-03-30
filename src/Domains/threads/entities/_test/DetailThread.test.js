import DetailThread from '../DetailThread.js';

describe('a DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'lorem ipsum dolor sit amet',
      username: 'john_doe',
      comments: [],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'sebuah thread',
      body: 'lorem ipsum dolor sit amet',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      comments: [],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError(
      'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });
  it('should throw error when comments is not an array', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'lorem ipsum dolor sit amet',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      comments: 'bukan array',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.COMMENTS_NOT_ARRAY');
  });
  it('should create DetailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'lorem ipsum dolor sit amet',
      date: '2021-08-08T07:19:09.775Z',
      username: 'john_doe',
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toBe('thread-123');
    expect(detailThread.title).toBe('sebuah thread');
    expect(detailThread.body).toBe('lorem ipsum dolor sit amet');
    expect(detailThread.date).toBe('2021-08-08T07:19:09.775Z');
    expect(detailThread.username).toBe('john_doe');
    expect(detailThread.comments).toEqual([]);
  });
});
