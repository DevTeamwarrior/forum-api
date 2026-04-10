class AuthenticationsController {
  constructor({ loginUserUseCase, refreshAuthenticationUseCase, logoutUserUseCase }) {
    this._loginUserUseCase = loginUserUseCase;
    this._refreshAuthenticationUseCase = refreshAuthenticationUseCase;
    this._logoutUserUseCase = logoutUserUseCase;
  }


  async postAuthentication(req, res, next) {
    try {
      const { username, password } = req.body;
      const { accessToken, refreshToken } = await this._loginUserUseCase.execute({ username, password });
      res.status(201).json({ status: 'success', data: { accessToken, refreshToken } });
    } catch (err) {
      console.error('[postAuthentication] Login error for username:', req.body.username, err);
      next(err);
    }
  }


  async putAuthentication(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const { accessToken } = await this._refreshAuthenticationUseCase.execute({ refreshToken });
      res.json({ status: 'success', data: { accessToken } });
    } catch (err) {
      err._from = 'put-auth';
      next(err);
    }
  }


  async deleteAuthentication(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await this._logoutUserUseCase.execute({ refreshToken });
      res.json({ status: 'success' });
    } catch (err) {
      err._from = 'delete-auth';
      next(err);
    }
  }
}

export default AuthenticationsController;
