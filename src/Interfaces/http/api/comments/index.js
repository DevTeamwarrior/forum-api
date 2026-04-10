import routes from './routes.js';
import CommentsController from './controller.js';


const comments = (container) => {
  const commentsController = new CommentsController(container);
  return routes(commentsController, container);
};

export default comments;
