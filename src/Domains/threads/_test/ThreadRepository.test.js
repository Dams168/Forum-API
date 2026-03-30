import ThreadRepository from '../ThreadRepository.js';

describe('ThreadRepository', () => {
  it('should throw an error when calling unimplemented method', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Act and Assert
    await expect(threadRepository.addThread({}, 'user-123')).rejects.toThrowError(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(threadRepository.verifyThreadById('thread-123')).rejects.toThrowError(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(threadRepository.getThreadById('thread-123')).rejects.toThrowError(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
