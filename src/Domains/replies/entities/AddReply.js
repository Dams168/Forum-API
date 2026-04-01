export default class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content } = payload;

    this.content = content;
  }

  _verifyPayload(payload) {
    if (!payload.content) {
      throw new Error('ADD_REPLY.NOT_CONTAIN_CONTENT');
    }

    if (typeof payload.content !== 'string') {
      throw new Error('ADD_REPLY.CONTENT_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}
