// Value object for refresh authentication (refresh token)
class RefreshAuth {
  constructor(payload) {
    this._verifyPayload(payload);
    this.refreshToken = payload.refreshToken;
  }

  _verifyPayload({ refreshToken }) {
    if (!refreshToken) {
      throw new Error('REFRESH_AUTH.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof refreshToken !== 'string') {
      throw new Error('REFRESH_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default RefreshAuth;
