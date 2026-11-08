import { registerUser, loginUser } from '../services/authService.js';
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie.js';

export async function register(req, res) {
  const user = await registerUser(req.body);
  setAuthCookie(res, user.id, false);
  res.status(201).json({ user });
}

export async function login(req, res) {
  const user = await loginUser(req.body);
  setAuthCookie(res, user.id, req.body.remember);
  res.json({ user });
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  res.json({ user: req.user });
}