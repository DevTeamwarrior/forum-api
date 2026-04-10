class RefreshAuthenticationUseCase {
  constructor({ authenticationRepository, tokenManager }) {
    this._authenticationRepository = authenticationRepository;
    this._tokenManager = tokenManager;
  }

  async execute(useCasePayload) {
    const { refreshToken } = useCasePayload;
    // 1. Verifikasi refresh token ada di database
    await this._authenticationRepository.checkAvailabilityToken(refreshToken);
    // 2. Decode token untuk dapatkan id
    const { id } = await this._tokenManager.verifyRefreshToken(refreshToken);
    // 3. Buat access token baru
    const accessToken = await this._tokenManager.createAccessToken({ id });
    return { accessToken };
  }
}

export default RefreshAuthenticationUseCase;
