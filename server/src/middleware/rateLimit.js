import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

function createLimiter({ limit, windowMs = 15 * 60 * 1000 }) {
  return rateLimit({
    windowMs,
    limit: env.NODE_ENV === 'test' ? 10000 : limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
  });
}

// Slows down password guessing on login and registration.
export const authLimiter = createLimiter({ limit: 20 });

// Slows down guessing of invite codes.
export const joinLimiter = createLimiter({ limit: 30 });

// Slows down probing for registered email addresses.
export const memberAddLimiter = createLimiter({ limit: 30 });