import routes from './routes.js';
import RepliesController from './controller.js';

const replies = (container) => {
  const controller = new RepliesController(container);
  return routes(controller);
};

export default replies;
