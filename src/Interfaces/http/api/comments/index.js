import routes from './routes.js';
import CommentsController from './controller.js';

const comments = (container) => {
  const controller = new CommentsController(container);
  return routes(controller);
};

export default comments;
