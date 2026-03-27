import { it } from 'vitest';
import CommentRepository from '../CommentRepository.js';

describe('a CommentRepository interface', () => {
  it('should throw error when invoke unimplemented behavior', async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action and Assert
    await expect(commentRepository.addComment({})).rejects.toThrowError(
      'COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});
