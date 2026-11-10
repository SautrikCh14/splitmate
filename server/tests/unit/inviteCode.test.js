import { describe, it, expect } from 'vitest';
import { generateInviteCode } from '../../src/utils/generateInviteCode.js';

describe('generateInviteCode', () => {
  it('makes 8 characters from an alphabet without look-alike characters', () => {
    for (let i = 0; i < 500; i += 1) {
      expect(generateInviteCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
    }
  });

  it('does not repeat itself in a large sample', () => {
    const codes = new Set(Array.from({ length: 5000 }, () => generateInviteCode()));
    expect(codes.size).toBe(5000);
  });

  it('honours a custom length', () => {
    expect(generateInviteCode(12)).toHaveLength(12);
  });
});