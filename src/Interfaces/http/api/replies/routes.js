import express from 'express';

const routes = (controller) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', (req, res) => controller.addReply(req, res));

  return router;
};

export default routes;
