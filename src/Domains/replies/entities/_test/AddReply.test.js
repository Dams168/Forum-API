import AddReply from '../AddReply.js';

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Act and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_CONTENT');
  });
  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 999, // Invalid data type
    };

    // Act and Assert
    expect(() => new AddReply(payload)).toThrowError(
      'ADD_REPLY.CONTENT_NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });
  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'This is a reply',
    };

    // Act
    const addReply = new AddReply(payload);

    // Assert
    expect(addReply).toBeInstanceOf(AddReply);
    expect(addReply.content).toEqual(payload.content);
  });
});
