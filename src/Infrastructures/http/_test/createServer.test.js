/* eslint-disable no-irregular-whitespace */
import request from 'supertest';
import { describe, it, expect, afterAll, afterEach, beforeEach } from 'vitest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
 
describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });
 


  // Cleanup user 'dicoding' sebelum dan sesudah test yang menggunakannya
  beforeEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });
 
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer(container);
    // Action
    const response = await request(server)
      .get('/unregisteredRoute');
    // Assert
    expect(response.status).toEqual(404);
  });

   describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
      // Arrange
      const app = await createServer({});

      // Action
      const response = await request(app).get('/');

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.data).toEqual('Hello world!');
    });
  });
 
  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      // Arrange
      const uniqueUsername = `dicoding_${Date.now()}_${Math.floor(Math.random() * 1000000000)}`;
      const requestPayload = {
        username: uniqueUsername,
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .post('/users')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedUser).toBeDefined();
    });
 
    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      };
      const server = await createServer(container);
 
      // Action
      const response = await request(server)
        .post('/users')
        .send(requestPayload);
 

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
    });
 
    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: ['Dicoding Indonesia'],
      };
      const server = await createServer(container);
 
      // Action
      const response = await request(server)
        .post('/users')
        .send(requestPayload);
 

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai');
    });
 
    it('should response 400 when username more than 50 character', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);
 
      // Action
      const response = await request(server)
        .post('/users')
        .send(requestPayload);
 
      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit');
    });
 
    it('should response 400 when username contain restricted character', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding indonesia',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);
 
      // Action
      const response = await request(server)
        .post('/users')
        .send(requestPayload);
 

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang');
    });
 
    it('should response 400 when username unavailable', async () => {
      // Arrange
      const client = await pool.connect();
      await UsersTableTestHelper.addUser({ username: 'dicoding', client });
      client.release();
      // Poll for user visibility using pool
      const maxPollAttempts = 60;
      const pollInterval = 200;
      let pollAttempts = 0;
      let found;
      while (pollAttempts < maxPollAttempts) {
        found = await pool.query('SELECT 1 FROM users WHERE username = $1', ['dicoding']);
        if (found.rowCount > 0) break;
        pollAttempts++;
        await new Promise(r => setTimeout(r, pollInterval));
      }
      if (!(found && found.rowCount)) {
        throw new Error('User not found after polling, cannot test username unavailable');
      }
      const requestPayload = {
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'super_secret',
      };
      const server = await createServer(container);

      // Action
      const response = await request(server)
        .post('/users')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('username tidak tersedia');
    });
  });
 
  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
      forceError: true, // trigger server error
    };
    const server = await createServer(container);

    // Action
    const response = await request(server)
      .post('/users')
      .send(requestPayload);

    // Assert
    expect(response.status).toEqual(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });
});