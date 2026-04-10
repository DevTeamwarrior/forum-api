import express from 'express';
import authMiddleware from '../../../../Infrastructures/http/middlewares/auth.js';

const routes = (controller, container) => {
  const router = express.Router({ mergeParams: true });

  // Only POST and DELETE are protected
  router.post('/', authMiddleware(container), controller.postComment);
  router.delete('/:commentId', authMiddleware(container), controller.deleteComment);


  return router;
};

export default routes;
