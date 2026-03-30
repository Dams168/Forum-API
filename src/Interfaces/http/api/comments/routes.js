import express from 'express';

const routes = (controller) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', (req, res) => {
    controller.addComment(req, res);
  });

  router.delete('/:commentId', (req, res) => {
    controller.deleteComment(req, res);
  });

  return router;
};

export default routes;
