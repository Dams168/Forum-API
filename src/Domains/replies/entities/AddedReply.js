export default class AddedReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, id, owner } = payload;

    this.content = content;
    this.id = id;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    const { id, content, owner } = payload;

    if (!id || !content || !owner) {
      throw new Error('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}
