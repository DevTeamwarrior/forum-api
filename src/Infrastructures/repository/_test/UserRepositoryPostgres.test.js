import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll } from 'vitest';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import InvariantError from '../../../Commons/exceptions/InvariantError.js';
import RegisterUser from '../../../Domains/users/entities/RegisterUser.js';
import RegisteredUser from '../../../Domains/users/entities/RegisteredUser.js';
import pool from '../../database/postgres/pool.js';
import UserRepositoryPostgres from '../UserRepositoryPostgres.js';

describe('UserRepositoryPostgres', () => {
  let testUserId;
  beforeEach(async () => {
    testUserId = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  });
  afterEach(async () => {
    // Hanya hapus user yang dibuat oleh test ini
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
  });
//
  afterAll(async () => {
    await pool.end();
  });

  describe('verifyUserCredential function', () => {
    let passwordHash;
    let bcrypt;
    beforeAll(async () => {
      bcrypt = (await import('bcrypt')).default;
      passwordHash = {
        compare: async (plain, hashed) => bcrypt.compare(plain, hashed),
      };
    });

    it('should return user id when username and password are correct', async () => {
      // Arrange
      const unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const id = `user_${unique}`;
      const username = `user_${unique}`;
      const password = 'secret_password';
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4)', [id, username, hashedPassword, 'User Test']);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const result = await userRepositoryPostgres.verifyUserCredential(username, password, passwordHash);

      // Assert
      expect(result).toBe(id);

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
    });

    it('should throw InvariantError when username not found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyUserCredential('not_exist_user', 'any', passwordHash)).rejects.toThrowError(InvariantError);
    });

    it('should throw error when password is incorrect', async () => {
      // Arrange
      const unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const id = `user_${unique}`;
      const username = `user_${unique}`;
      const password = 'secret_password';
      const wrongPassword = 'wrong_password';
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4)', [id, username, hashedPassword, 'User Test']);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyUserCredential(username, wrongPassword, passwordHash)).rejects.toThrowError('LOGIN_USER.INVALID_CREDENTIALS');

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
    });
  });
//
  describe('verifyAvailableUsername function', () => {

    it('should throw InvariantError when username not available', async () => {
      // Arrange
      const username = `dicoding_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const client = await pool.connect();
      try {
        await UsersTableTestHelper.addUser({ id: testUserId, username, client });
        // Polling until user is visible in DB (avoid race condition)
        const maxPollAttempts = 60;
        const pollInterval = 200;
        let pollAttempts = 0;
        let found;
        while (pollAttempts < maxPollAttempts) {
          found = await client.query('SELECT 1 FROM users WHERE username = $1', [username]);
          if (found.rowCount > 0) break;
          pollAttempts++;
          await new Promise(r => setTimeout(r, pollInterval));
        }
        if (!(found && found.rowCount)) {
          throw new Error('User not found after polling, cannot test verifyAvailableUsername');
        }
      } finally {
        client.release();
      }
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername(username)).rejects.toThrowError(InvariantError);
    }, 20000);
//
    it('should not throw InvariantError when username available', async () => {
      // Arrange
      const username = `dicoding_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername(username)).resolves.not.toThrowError(InvariantError);
    });
  });
//
  describe('addUser function', () => {
    // No global cleanTable here
    it('should persist register user', async () => {
      // Arrange
      const unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const id = `user_${unique}`;
      const username = `dicoding_${unique}`;
      const registerUser = new RegisterUser({
        username,
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => unique;
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Poll for user visibility in DB
      const maxPollAttempts = 60;
      const pollInterval = 200;
      let pollAttempts = 0;
      let users = [];
      while (pollAttempts < maxPollAttempts) {
        users = await UsersTableTestHelper.findUsersById(id);
        if (users.length > 0) break;
        pollAttempts++;
        await new Promise(r => setTimeout(r, pollInterval));
      }
      expect(users).toHaveLength(1);
    });

    it('should return registered user correctly', async () => {
      // Arrange
      const unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const id = `user_${unique}`;
      const username = `dicoding_${unique}`;
      const registerUser = new RegisterUser({
        username,
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => unique;
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id,
        username,
        fullname: 'Dicoding Indonesia',
      }));
    });
  });
});