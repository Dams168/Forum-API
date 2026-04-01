import config from '../../../Commons/config.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }

    const accessToken = authorization.replace('Bearer ', '');
    const payload = jwt.verify(accessToken, config.auth.accessTokenKey);

    req.auth = payload;
    return next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    return next(new AuthenticationError('access token tidak valid'));
  }
};

export default authMiddleware;
