/* istanbul ignore file */
import UsersTableTestHelper from './UsersTableTestHelper.js';

const AccessTokenTestHelper = {
  async getAccessToken(tokenManager) {
    const unique = Date.now();
    const userId = `user-${unique}`;
    const username = `dicoding-${unique}`;

    await UsersTableTestHelper.addUser({ id: userId, username });
    const accessToken = await tokenManager.createAccessToken({ id: userId, username });

    return { accessToken, userId };
  },
};

export default AccessTokenTestHelper;
