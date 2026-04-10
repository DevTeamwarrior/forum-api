import express from 'express';
import authMiddleware from '../../../../Infrastructures/http/middlewares/auth.js';

const routes = (controller, container) => {
  const router = express.Router({ mergeParams: true });

  // Replies endpoints
  router.post('/', authMiddleware(container), controller.postReply);
  router.delete('/:replyId', authMiddleware(container), controller.deleteReply);

  return router;
};

export default routes;
