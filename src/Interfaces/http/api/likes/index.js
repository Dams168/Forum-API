import LikesController from './controller.js';
import routes from './routes.js';

const likes = (container) => {
  const controller = new LikesController(container);
  return routes(controller);
};

export default likes;
