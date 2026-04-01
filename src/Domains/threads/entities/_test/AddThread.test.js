import AddThread from '../AddThread.js';

describe('AddThread', () => {
  // Test cases for AddThread

  it('should throw an error when required fields are missing', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
    };
    // Act and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error when fields do not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
      body: 123, // Invalid data type
    };
    // Act and Assert
    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw an error when the title exceeds the character limit', () => {
    // Arrange
    const payload = {
      title: 'A'.repeat(101), // Exceeds the 100-character limit
      body: 'Thread Body',
    };
    // Act and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create an AddThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
      body: 'Thread Body',
    };
    // Act
    const addThread = new AddThread(payload);
    // Assert
    expect(addThread).toBeInstanceOf(AddThread);
    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
  });
});
