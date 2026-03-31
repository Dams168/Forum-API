import express from 'express';

const routes = (controller) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', (req, res) => controller.addReply(req, res));
  router.delete('/:replyId', (req, res) => controller.deleteReply(req, res));

  return router;
};

export default routes;
