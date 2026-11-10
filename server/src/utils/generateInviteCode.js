import { randomInt } from 'node:crypto';

// No 0, O, 1 or I, so a code is easy to read out loud or copy from a screenshot.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length = 8) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)]; // cryptographically secure
  }
  return code;
}