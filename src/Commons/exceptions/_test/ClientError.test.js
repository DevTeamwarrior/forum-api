import { describe, it, expect } from 'vitest';
import ClientError from '../ClientError.js';

describe('ClientError', () => {

  it('should throw error when directly instantiated', () => {
    expect(() => {
      const err = new ClientError('error');
      ClientError.throwIfDirectInstantiation(err);
    }).toThrowError('cannot instantiate abstract class');
  });

  it('should allow subclassing and set properties correctly', () => {
    class MyError extends ClientError {
      constructor(...args) {
        super(...args);
        ClientError.throwIfDirectInstantiation(this);
      }
    }
    const err = new MyError('test message', 418);
    expect(err).toBeInstanceOf(ClientError);
    expect(err.message).toBe('test message');
    expect(err.name).toBe('ClientError');
    expect(err.statusCode).toBe(418);
  });

  it('should default statusCode to 400 if not provided', () => {
    class MyError extends ClientError {
      constructor(...args) {
        super(...args);
        ClientError.throwIfDirectInstantiation(this);
      }
    }
    const err = new MyError('default code');
    expect(err.statusCode).toBe(400);
  });
});