/* eslint-disable no-irregular-whitespace */
import InvariantError from '../../Commons/exceptions/InvariantError.js';
import RegisteredUser from '../../Domains/users/entities/RegisteredUser.js';
import UserRepository from '../../Domains/users/UserRepository.js';
 
class UserRepositoryPostgres extends UserRepository {
	async verifyUserCredential(username, password, passwordHash) {
		const query = {
			text: 'SELECT id, password FROM users WHERE username = $1',
			values: [username],
		};
		const result = await this._pool.query(query);
		if (!result.rowCount) {
			console.error('[verifyUserCredential] Username not found:', username);
			throw new InvariantError('username tidak ditemukan');
		}
		const { id, password: hashedPassword } = result.rows[0];
		const isMatch = await passwordHash.compare(password, hashedPassword);
		if (!isMatch) {
			console.error('[verifyUserCredential] Password not match for username:', username);
			throw new Error('LOGIN_USER.INVALID_CREDENTIALS');
		}
		return id;
	}
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }
 
  async verifyAvailableUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
 
    const result = await this._pool.query(query);
 
    if (result.rowCount) {
      throw new InvariantError('username tidak tersedia');
    }
  }
 
	async addUser(registerUser) {
		const { username, password, fullname } = registerUser;
		const id = `user_${this._idGenerator()}`;
		const query = {
			text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username, fullname',
			values: [id, username, password, fullname],
		};
		const result = await this._pool.query(query);
		return new RegisteredUser({ ...result.rows[0] });
	}
}
 
export default UserRepositoryPostgres;