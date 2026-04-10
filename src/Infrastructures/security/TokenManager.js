import jwt from 'jsonwebtoken';

class TokenManager {
  constructor(secret, refreshSecret) {
    this._secret = secret;
    this._refreshSecret = refreshSecret || secret;
  }

  async createAccessToken(payload) {
    return jwt.sign(payload, this._secret, { expiresIn: '15m' });
  }

  async createRefreshToken(payload) {
    return jwt.sign(payload, this._refreshSecret, { expiresIn: '7d' });
  }

  async verifyAccessToken(token) {
    try {
      return jwt.verify(token, this._secret);
    } catch {
      throw new Error('TOKEN_MANAGER.INVALID_ACCESS_TOKEN');
    }
  }

  async verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this._refreshSecret);
    } catch {
      throw new Error('TOKEN_MANAGER.INVALID_REFRESH_TOKEN');
    }
  }
}

export default TokenManager;
