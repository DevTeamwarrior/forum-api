// Value object for new authentication (refresh token)
class NewAuth {
  constructor(payload) {
    this._verifyPayload(payload);
    this.refreshToken = payload.refreshToken;
  }

  _verifyPayload({ refreshToken }) {
    if (!refreshToken) {
      throw new Error('NEW_AUTH.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof refreshToken !== 'string') {
      throw new Error('NEW_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default NewAuth;
