/*
  Interface AuthenticationRepository
  - addToken(token: string): Promise<void>
  - checkAvailabilityToken(token: string): Promise<void>
  - deleteToken(token: string): Promise<void>
*/

class AuthenticationRepository {
  async addToken(/* token */) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async checkAvailabilityToken(/* token */) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteToken(/* token */) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

export default AuthenticationRepository;
