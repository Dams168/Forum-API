import routes from './routes.js';
import ThreadController from './controller.js';

const threads = (container) => {
  const controller = new ThreadController(container);

  return routes(controller);
};

export default threads;
