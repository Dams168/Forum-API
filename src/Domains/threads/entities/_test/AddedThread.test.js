import { it } from 'vitest';
import AddedThread from '../AddedThread.js';

describe('AddedThread', () => {
  it('should throw an error when required fields are missing', () => {
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw an error when fields do not meet data type specification', () => {
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
      owner: 123, // Invalid data type
    };

    expect(() => new AddedThread(payload)).toThrowError(
      'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create an AddedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
      owner: 'user1',
    };

    const addedThread = new AddedThread(payload);

    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
