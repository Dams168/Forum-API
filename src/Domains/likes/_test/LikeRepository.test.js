import LikeRepository from '../LikeRepository.js';

describe('LikeRepository', () => {
  it('should throw an error when calling unimplemented method', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Act and Assert
    await expect(
      likeRepository.checkIfUserHasLikedComment('comment-123', 'user-123'),
    ).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(likeRepository.addLikeComment('comment-123', 'user-123')).rejects.toThrowError(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(likeRepository.unLikeComment('comment-123', 'user-123')).rejects.toThrowError(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );

    await expect(likeRepository.countLikeComment('comment-123')).rejects.toThrowError(
      'LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
