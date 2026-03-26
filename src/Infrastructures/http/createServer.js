import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../../Commons/config.js';
import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';
import users from '../../Interfaces/http/api/users/index.js';
import authentications from '../../Interfaces/http/api/authentications/index.js';
import threads from '../../Interfaces/http/api/threads/index.js';

const authMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthenticationError('akses ditolak. membutuhkan access token');
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

const createServer = async (container) => {
  const app = express();

  // Middleware for parsing JSON
  app.use(express.json());

  // Register routes
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  app.use('/threads', authMiddleware, threads(container));

  // Global error handler
  app.use((error, req, res, next) => {
    // console.error(error); // log error for debugging
    // bila response tersebut error, tangani sesuai kebutuhan
    const translatedError = DomainErrorTranslator.translate(error);

    // penanganan client error secara internal.
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // penanganan server error sesuai kebutuhan
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Route not found',
    });
  });

  return app;
};

export default createServer;
