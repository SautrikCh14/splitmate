import bcrypt from 'bcrypt';
import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

const BCRYPT_ROUNDS = 12;

// Compared against when an email does not exist, so a failed login takes about the same
// time whether or not the account exists (prevents guessing emails from response times).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

// The only user fields that ever leave the server. passwordHash is deliberately absent.
export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    preferredCurrency: user.preferredCurrency,
    theme: user.theme,
    notificationPrefs: user.notificationPrefs,
    createdAt: user.createdAt,
  };
}

export async function registerUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({ data: { name, email, passwordHash } });
    return toPublicUser(user);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(409, 'An account with this email already exists', {
        email: 'An account with this email already exists',
      });
    }
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || user.deletedAt || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }
  return toPublicUser(user);
}

export async function findActiveUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.deletedAt) return null;
  return toPublicUser(user);
}