import express from 'express';
import authMiddleware from '../../../../Infrastructures/http/middleware/AuthMiddleware.js';

const routes = (controller) => {
  const router = express.Router();

  router.post('/', authMiddleware, controller.postThreadController);
  router.get('/:threadId', controller.getDetailThreadController);

  return router;
};

export default routes;
