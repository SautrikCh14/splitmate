import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'splitmate_token';

const DAY_MS = 24 * 60 * 60 * 1000;
const REMEMBER_DAYS = 30;

const cookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read this cookie
  sameSite: 'lax', // not sent on cross-site POST requests (CSRF protection)
  secure: env.NODE_ENV === 'production', // HTTPS only in production
  path: '/',
};

export function setAuthCookie(res, userId, remember) {
  const token = jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    algorithm: 'HS256',
    expiresIn: remember ? `${REMEMBER_DAYS}d` : '1d',
  });

  // With "remember me" the cookie survives browser restarts.
  // Without it, no maxAge is set, so it is a session cookie.
  res.cookie(COOKIE_NAME, token, remember ? { ...cookieOptions, maxAge: REMEMBER_DAYS * DAY_MS } : cookieOptions);
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

// Returns the user id inside a valid token, or null if the token is missing, forged or expired.
export function readUserIdFromToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}