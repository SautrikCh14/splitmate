import { AppError } from '../utils/AppError.js';

const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Rejects state-changing requests that carry a body but are not JSON.
// Browsers cannot send application/json from a plain cross-site form,
// so this adds a second layer of CSRF protection next to SameSite cookies.
export function requireJsonBody(req, res, next) {
  const hasBody = Number(req.headers['content-length'] || 0) > 0 || Boolean(req.headers['transfer-encoding']);

  if (METHODS_WITH_BODY.includes(req.method) && hasBody && !req.is('application/json')) {
    return next(new AppError(415, 'Content-Type must be application/json'));
  }
  next();
}