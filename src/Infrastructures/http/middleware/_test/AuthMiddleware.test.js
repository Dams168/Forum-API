import { afterEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import authMiddleware from '../AuthMiddleware.js';

describe('AuthMiddleware', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls next without error when token is valid', () => {
    const payload = { id: 'user-123' };
    vi.spyOn(jwt, 'verify').mockReturnValue(payload);
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const res = {};
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(req.auth).toEqual(payload);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes AuthenticationError when authorization header missing', () => {
    const req = { headers: {} };
    const res = {};
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Missing authentication');
  });

  it('wraps unexpected errors into AuthenticationError', () => {
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('invalid');
    });
    const req = {
      headers: { authorization: 'Bearer invalid-token' },
    };
    const res = {};
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('access token tidak valid');
  });
});
