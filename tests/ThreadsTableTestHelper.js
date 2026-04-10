import pool from '../src/Infrastructures/database/postgres/pool.js';

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123', title = 'Thread Title', body = 'Thread body', owner = 'user-123', date = new Date().toISOString(),
  } = {}) {
    const query = {
      text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };
    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable(threadId) {
    if (threadId) {
      await pool.query('DELETE FROM threads WHERE id = $1', [threadId]);
    } else {
      await pool.query('TRUNCATE TABLE threads CASCADE');
    }
  },
};

export default ThreadsTableTestHelper;
