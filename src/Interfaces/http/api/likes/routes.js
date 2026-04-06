import express from 'express';

const routes = (controller) => {
  const router = express.Router({ mergeParams: true });

  router.put('/', (req, res) => {
    controller.likeUnlikeComment(req, res);
  });

  return router;
};

export default routes;
