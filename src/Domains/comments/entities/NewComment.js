
import InvariantError from '../../../Commons/exceptions/InvariantError.js';

class NewComment {
  constructor(payload) {
    // Support both camelCase (threadId) and snake_case (thread_id)
    const thread_id = payload.thread_id || payload.threadId;
    this._verifyPayload({ ...payload, thread_id });
    this.content = payload.content;
    this.thread_id = thread_id;
    this.owner = payload.owner;
  }

  _verifyPayload({ content, thread_id, owner }) {
    if (!content || !thread_id || !owner) {
      throw new InvariantError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof content !== 'string' ||
      typeof thread_id !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new InvariantError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default NewComment;
