import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';

import request from 'supertest';
import { describe, it, expect, afterEach } from 'vitest';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../../http/createServer.js';
// import bcrypt from 'bcrypt';


describe('/authentications endpoint', () => {

  // Gunakan array untuk menyimpan semua username yang dibuat di setiap test
  const allCreatedUsernames = [];
  afterEach(async () => {
    if (allCreatedUsernames.length > 0) {
      for (const username of allCreatedUsernames) {
        await pool.query('DELETE FROM users WHERE username = $1', [username]);
      }
      allCreatedUsernames.length = 0;
    }
  });

  it('should login and return tokens', async () => {
    const createdUsernames = [];
    const serverInstance = await createServer(container);
    const currentTimestamp = Date.now();
    const currentUsername = `userauth_${currentTimestamp}_${Math.floor(Math.random() * 1000000000)}`;
    const currentUserId = `user-${currentTimestamp}-${Math.floor(Math.random() * 1000000000)}`;
    createdUsernames.push(currentUsername);
    allCreatedUsernames.push(currentUsername);
    // const userPayload = {
    //   id: currentUserId,
    //   username: currentUsername,
    //   password: 'secret',
    //   fullname: 'User Auth',
    // };
    const loginPayload = {
      username: currentUsername,
      password: 'secret',
    };
    // Create user directly in DB
    await UsersTableTestHelper.addUser({
      id: currentUserId,
      username: currentUsername,
      password: 'secret',
      fullname: 'User Auth',
      hashPassword: true,
    });
    // Polling: Confirm user exists in DB (anti-race)
    let found;
    let pollAttempts = 0;
    const maxPollAttempts = 20;
    const pollDelay = 200;
    while (pollAttempts < maxPollAttempts) {
      found = await pool.query('SELECT * FROM users WHERE username = $1', [currentUsername]);
      if (found && found.rowCount === 1) break;
      pollAttempts++;
      if (pollAttempts < maxPollAttempts) {
        await new Promise(r => setTimeout(r, pollDelay));
      }
    }
    expect(found && found.rowCount).toBe(1);
    // Login with the SAME server instance, with retry on user-not-found (anti-flake)
    let response;
    let loginAttempts = 0;
    const maxLoginAttempts = 20;
    const loginRetryDelay = 300;
    while (loginAttempts < maxLoginAttempts) {
      response = await request(serverInstance)
        .post('/authentications')
        .send(loginPayload);
      // Only break if login success (201) and token present
      if (response.status === 201 && response.body && response.body.data && response.body.data.accessToken) {
        break;
      }
      // If user not found, retry
      if (response.body && response.body.message && response.body.message.includes('username tidak ditemukan')) {
        loginAttempts++;
        if (loginAttempts < maxLoginAttempts) {
          await new Promise(r => setTimeout(r, loginRetryDelay));
          continue;
        }
      }
      // For other errors, break and fail
      break;
    }
    if (!response) {
      throw new Error('No response received from /authentications');
    }
    if (response.error) {
      console.error('Response error:', response.error);
    }
    if (response.status !== 201) {
      console.error('Login failed:', response.status, response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  }, 20000);

  it('should refresh access token', async () => {
    const createdUsernames = [];
    const serverInstance = await createServer(container);
    const currentTimestamp = Date.now();
    const currentUsername = `userauth_${currentTimestamp}_${Math.floor(Math.random() * 1000000000)}`;
    const currentUserId = `user-${currentTimestamp}-${Math.floor(Math.random() * 1000000000)}`;
    createdUsernames.push(currentUsername);
    allCreatedUsernames.push(currentUsername);
    // userPayload removed (was unused)
    const loginPayload = {
      username: currentUsername,
      password: 'secret',
    };
    // Create user directly in DB
    await UsersTableTestHelper.addUser({
      id: currentUserId,
      username: currentUsername,
      password: 'secret',
      fullname: 'User Auth',
      hashPassword: true,
    });
    // Polling: Confirm user exists in DB (anti-race)
    let found;
    let pollAttempts = 0;
    const maxPollAttempts = 20;
    const pollDelay = 200;
    while (pollAttempts < maxPollAttempts) {
      found = await pool.query('SELECT * FROM users WHERE username = $1', [currentUsername]);
      if (found && found.rowCount === 1) break;
      pollAttempts++;
      if (pollAttempts < maxPollAttempts) {
        await new Promise(r => setTimeout(r, pollDelay));
      }
    }
    expect(found && found.rowCount).toBe(1);
    // Login with the SAME server instance
    let loginRes;
    let loginAttempts = 0;
    const maxLoginAttempts = 20;
    const loginRetryDelay = 500;
    while (loginAttempts < maxLoginAttempts) {
      loginRes = await request(serverInstance)
        .post('/authentications')
        .send(loginPayload);
      if (loginRes.body && loginRes.body.data && loginRes.body.data.refreshToken) {
        break;
      }
      loginAttempts++;
      if (loginAttempts < maxLoginAttempts) {
        await new Promise(r => setTimeout(r, loginRetryDelay));
      }
    }
    if (!loginRes.body || !loginRes.body.data || !loginRes.body.data.refreshToken) {
      // Log response for debug
      console.error('Login response:', loginRes.body);
      throw new Error('Login failed, cannot test refresh token');
    }
    const refreshToken = loginRes.body.data.refreshToken;
    const response = await request(serverInstance)
      .put('/authentications')
      .send({ refreshToken });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();
  }, 20000);

  it('should logout and remove refresh token', async () => {
    const createdUsernames = [];
    const serverInstance = await createServer(container);
    const currentTimestamp = Date.now();
    const currentUsername = `userauth_${currentTimestamp}_${Math.floor(Math.random() * 1000000000)}`;
    const currentUserId = `user-${currentTimestamp}-${Math.floor(Math.random() * 1000000000)}`;
    createdUsernames.push(currentUsername);
    allCreatedUsernames.push(currentUsername);
    // userPayload removed (was unused)
    const loginPayload = {
      username: currentUsername,
      password: 'secret',
    };
    // Create user directly in DB
    await UsersTableTestHelper.addUser({
      id: currentUserId,
      username: currentUsername,
      password: 'secret',
      fullname: 'User Auth',
      hashPassword: true,
    });
    // Polling: Confirm user exists in DB (anti-race)
    let found;
    let pollAttempts = 0;
    const maxPollAttempts = 20;
    const pollDelay = 200;
    while (pollAttempts < maxPollAttempts) {
      found = await pool.query('SELECT * FROM users WHERE username = $1', [currentUsername]);
      if (found && found.rowCount === 1) break;
      pollAttempts++;
      if (pollAttempts < maxPollAttempts) {
        await new Promise(r => setTimeout(r, pollDelay));
      }
    }
    expect(found && found.rowCount).toBe(1);
    // Login with retry loop (mirroring refresh test) using SAME server instance
    let loginRes;
    let loginAttempts = 0;
    const maxLoginAttempts = 10;
    const loginRetryDelay = 300;
    while (loginAttempts < maxLoginAttempts) {
      loginRes = await request(serverInstance)
        .post('/authentications')
        .send(loginPayload);
      if (loginRes.body && loginRes.body.data && loginRes.body.data.refreshToken) {
        break;
      }
      loginAttempts++;
      if (loginAttempts < maxLoginAttempts) {
        await new Promise(r => setTimeout(r, loginRetryDelay));
      }
    }
    if (!loginRes.body || !loginRes.body.data || !loginRes.body.data.refreshToken) {
      console.error('Login response:', loginRes.body);
      throw new Error('Login failed, cannot test logout');
    }
    const refreshToken = loginRes.body.data.refreshToken;
    const response = await request(serverInstance)
      .delete('/authentications')
      .send({ refreshToken });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });
});
