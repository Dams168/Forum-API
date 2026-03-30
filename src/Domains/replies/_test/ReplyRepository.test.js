import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository', () => {
  it('should throw an error when calling unimplemented method', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Act and Assert
    await expect(replyRepository.addReply({}, 'user-123', 'comment-123')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
