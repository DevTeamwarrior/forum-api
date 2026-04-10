/* eslint-disable no-irregular-whitespace */
import ClientError from './ClientError.js';
 
class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
 
export default NotFoundError;