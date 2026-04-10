import express from 'express';
import LikeController from './controller.js';
import authMiddleware from '../../../../Infrastructures/http/middlewares/auth.js';

export default (container) => {
  const router = express.Router();
  const controller = new LikeController(container);

  router.put(
    '/:threadId/comments/:commentId/likes',
    authMiddleware(container),
    controller.toggleLikeComment
  );

  return router;
};
