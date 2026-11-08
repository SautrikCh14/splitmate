import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message, ...(err.details && { errors: err.details }) });
  }

  // Errors raised by the JSON body parser
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  // Prisma: a unique constraint was violated (safety net; services handle the common cases)
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'That value is already in use' });
  }

  if (env.NODE_ENV !== 'test') console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
}