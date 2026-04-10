import AuthenticationsController from './controller.js';
import createAuthRoutes from './routes.js';

export default function (container) {
  const controller = new AuthenticationsController({
    loginUserUseCase: container.getInstance('LoginUserUseCase'),
    refreshAuthenticationUseCase: container.getInstance('RefreshAuthenticationUseCase'),
    logoutUserUseCase: container.getInstance('LogoutUserUseCase'),
  });
  return createAuthRoutes(controller);
}
