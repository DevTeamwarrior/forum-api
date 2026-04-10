class LoginUserUseCase {
  constructor({ userRepository, passwordHash, tokenManager, authenticationRepository }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
    this._tokenManager = tokenManager;
    this._authenticationRepository = authenticationRepository;
  }

  async execute(useCasePayload) {
    const { username, password } = useCasePayload;
    // 1. Verifikasi user
    const id = await this._userRepository.verifyUserCredential(username, password, this._passwordHash);
    // 2. Buat token
    const accessToken = await this._tokenManager.createAccessToken({ id });
    const refreshToken = await this._tokenManager.createRefreshToken({ id });
    // 3. Simpan refresh token
    await this._authenticationRepository.addToken(refreshToken);
    // 4. Return
    return { accessToken, refreshToken };
  }
}

export default LoginUserUseCase;
