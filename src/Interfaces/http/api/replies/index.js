import routes from './routes.js';
import RepliesController from './controller.js';

const replies = (container) => {
  const repliesController = new RepliesController(container);
  return routes(repliesController, container);
};

export default replies;
