import AddedReply from '../AddedReply.js';

describe('a AddedReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'This is a reply',
      id: 'reply-123',
    };

    // Act and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 789, // Invalid data type
      id: 456,
      owner: 123,
    };

    // Act and Assert
    expect(() => new AddedReply(payload)).toThrowError(
      'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create AddedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'This is a reply',
      owner: 'user-123',
    };

    // Act
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply).toBeInstanceOf(AddedReply);
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
