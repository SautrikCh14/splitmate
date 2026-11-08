import { COOKIE_NAME, readUserIdFromToken } from '../utils/authCookie.js';
import { findActiveUserById } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

// Protects a route. On success, req.user holds the logged-in user (without secrets).
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError(401, 'Please log in to continue');

  const userId = readUserIdFromToken(token);
  if (!userId) throw new AppError(401, 'Your session has expired. Please log in again.');

  // Load the user on every request, so a deleted account stops working immediately.
  const user = await findActiveUserById(userId);
  if (!user) throw new AppError(401, 'Your session has expired. Please log in again.');

  req.user = user;
  next();
}