
class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, date, content, is_delete, likeCount = 0 } = payload;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? '**komentar telah dihapus**' : content;
    this.likeCount = likeCount;
  }

  _verifyPayload({ id, username, date, content, is_delete, likeCount }) {
    if (!id || !username || !date || content === undefined || is_delete === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (likeCount !== undefined && typeof likeCount !== 'number') {
      throw new Error('DETAIL_COMMENT.LIKE_COUNT_MUST_BE_NUMBER');
    }
  }
}

export default DetailComment;
