import express from 'express';

function createAuthRoutes(controller) {
  const router = express.Router();
  router.post('/', controller.postAuthentication.bind(controller));
  router.put('/', controller.putAuthentication.bind(controller));
  router.delete('/', controller.deleteAuthentication.bind(controller));
  return router;
}

export default createAuthRoutes;
