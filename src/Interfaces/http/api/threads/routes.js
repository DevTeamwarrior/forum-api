import express from 'express';
import comments from '../comments/index.js';
import replies from '../replies/index.js';
import authMiddleware from '../../../../Infrastructures/http/middlewares/auth.js';

const routes = (controller, container) => {
  const router = express.Router();

  // Only POST /threads is protected
  router.post('/', authMiddleware(container), controller.postThread);

  // GET /threads/:threadId is public
  router.get('/:threadId', controller.getThreadDetail);

  // Nested comments endpoint: /threads/:threadId/comments
  router.use('/:threadId/comments', (req, res, next) => {
    req.threadId = req.params.threadId;
    next();
  }, comments(container));

  // Nested replies endpoint: /threads/:threadId/comments/:commentId/replies
  router.use('/:threadId/comments/:commentId/replies', (req, res, next) => {
    req.threadId = req.params.threadId;
    req.commentId = req.params.commentId;
    next();
  }, replies(container));

  return router;
};

export default routes;
