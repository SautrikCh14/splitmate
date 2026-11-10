import { z } from 'zod';
import { email } from './authValidators.js';

// Deliberately no format rules: a wrong or expired code gets the same answer either way.
export const joinGroupSchema = z.object({
  code: z.string('Enter an invite code').trim().toUpperCase().min(1, 'Enter an invite code').max(32, 'Enter an invite code'),
});

// null or missing means the code never expires.
export const regenerateInviteSchema = z.object({
  expiresInDays: z
    .union([z.literal(1), z.literal(7), z.literal(30)], 'Choose 1, 7 or 30 days, or no expiry')
    .nullable()
    .optional(),
});

export const addMemberSchema = z.object({ email });

export const setRoleSchema = z.strictObject({
  role: z.enum(['ADMIN', 'MEMBER', 'OWNER'], 'Choose admin, member or owner'),
});