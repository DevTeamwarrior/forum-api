import AuthenticationRepository from '../../Domains/authentications/AuthenticationRepository.js';

class AuthenticationRepositoryPostgres extends AuthenticationRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async addToken(token) {
    const query = {
      text: 'INSERT INTO authentications (token) VALUES ($1)',
      values: [token],
    };
    await this._pool.query(query);
  }

  async checkAvailabilityToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('AUTHENTICATION_REPOSITORY.TOKEN_NOT_FOUND');
    }
  }

  async deleteToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new Error('refresh token tidak ditemukan di database');
    }
  }
}

export default AuthenticationRepositoryPostgres;
