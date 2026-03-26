import request from 'supertest';
import pool from '../src/Infrastructures/database/postgres/pool.js';

export default class TokenTableTestHelper {
  constructor(server) {
    this._server = server;
  }

  static async cleanTable() {
    await pool.query('DELETE FROM authentications');
    await pool.query('DELETE FROM users');
  }

  async getTokenandUserId(
    requestPayload = {
      username: 'johndoe',
      password: 'password',
      fullname: 'john doe',
    },
  ) {
    const registerResponse = await request(this._server).post('/users').send(requestPayload);

    if (registerResponse.status !== 201) {
      throw new Error(
        `Failed to register test user: ${registerResponse.status} ${registerResponse.body.message ?? ''}`,
      );
    }

    const loginResponse = await request(this._server).post('/authentications').send({
      username: requestPayload.username,
      password: requestPayload.password,
    });

    if (loginResponse.status !== 201) {
      throw new Error(
        `Failed to login test user: ${loginResponse.status} ${loginResponse.body.message ?? ''}`,
      );
    }

    const {
      data: { accessToken },
    } = loginResponse.body;

    const {
      data: {
        addedUser: { id },
      },
    } = registerResponse.body;

    return { accessToken, userId: id };
  }
}
