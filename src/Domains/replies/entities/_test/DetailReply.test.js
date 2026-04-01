import { describe, it } from 'vitest';
import DetailReply from '../DetailReply.js';

describe('a DetailReply entities', () => {
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'sebuah balasan comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      isDelete: false,
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should create DetailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan comment',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      isDelete: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual('reply-123');
    expect(detailReply.content).toEqual('sebuah balasan comment');
    expect(detailReply.date).toEqual('2021-08-08T07:19:09.775Z');
    expect(detailReply.username).toEqual('dicoding');
  });

  it('should mask content when reply already deleted', () => {
    const payload = {
      id: 'reply-999',
      content: 'should be hidden',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      isDelete: true,
    };

    const detailReply = new DetailReply(payload);

    expect(detailReply.content).toEqual('**balasan telah dihapus**');
  });
});
