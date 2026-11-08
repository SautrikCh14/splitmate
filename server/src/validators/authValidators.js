import { z } from 'zod';

const email = z
  .string('Enter your email address')
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a valid email address'));

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected.
const newPassword = z
  .string('Enter a password')
  .min(8, 'Use at least 8 characters')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, 'Password is too long (72 bytes maximum)');

export const registerSchema = z
  .object({
    name: z.string('Enter your full name').trim().min(2, 'Enter your full name').max(60, 'Name is too long'),
    email,
    password: newPassword,
    confirmPassword: z.string('Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email,
  password: z.string('Enter your password').min(1, 'Enter your password').max(200, 'Password is too long'),
  remember: z.boolean().optional().default(false),
});