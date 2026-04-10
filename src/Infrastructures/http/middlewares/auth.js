import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const authMiddleware = (container) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AuthenticationError('Missing authentication');
    const token = authHeader.replace('Bearer ', '');
    const tokenManager = container.getInstance('TokenManager');
    const payload = await tokenManager.verifyAccessToken(token);
    req.auth = { credentials: { id: payload.id } };
    next();
  } catch {
    next(new AuthenticationError('Missing authentication'));
  }
};

export default authMiddleware;
