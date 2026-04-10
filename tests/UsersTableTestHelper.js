/* eslint-disable no-irregular-whitespace */
/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const UsersTableTestHelper = {
  async addUser({
    id = 'user-123', username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia', hashPassword = true, client = null,
  }) {
    let hashedPassword = password;
    if (hashPassword) {
      // Dynamically import bcrypt to avoid circular deps
      const bcrypt = (await import('bcrypt')).default;
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, hashedPassword, fullname],
    };
    if (client) {
      await client.query(query);
    } else {
      await pool.query(query);
    }
  },
 
  async findUsersById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };
 
    const result = await pool.query(query);
    return result.rows;
  },
 
	async cleanTable(userId, client = null) {
		// Delete all rows in dependency order to avoid deadlocks
		const executor = client ? client : pool;
		await executor.query('DELETE FROM comments');
		await executor.query('DELETE FROM threads');
		if (userId) {
			await executor.query('DELETE FROM users WHERE id = $1', [userId]);
		} else {
			await executor.query('DELETE FROM users');
		}
	},
};
 
export default UsersTableTestHelper;