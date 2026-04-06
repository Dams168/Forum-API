export default class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, content, date, username, replies = [], likeCount = 0, isDeleted = false } = payload;
    this.id = id;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.date = date;
    this.username = username;
    this.replies = replies;
    this.likeCount = likeCount;
  }

  _verifyPayload(payload) {
    const { id, content, date, username, replies, likeCount, isDeleted } = payload;

    if (!id || !content || !date || !username) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof content !== 'string' ||
      typeof date !== 'string' ||
      typeof username !== 'string' ||
      (likeCount !== undefined && typeof likeCount !== 'number') ||
      typeof isDeleted !== 'boolean'
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (replies !== undefined && !Array.isArray(replies)) {
      throw new Error('DETAIL_COMMENT.REPLIES_NOT_ARRAY');
    }
  }
}
