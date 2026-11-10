import { describe, it, expect } from 'vitest';
import { can } from '../../src/utils/permissions.js';

describe('permissions matrix', () => {
  it('lets every member view the group', () => {
    for (const role of ['OWNER', 'ADMIN', 'MEMBER']) expect(can(role, 'group:view')).toBe(true);
  });

  it('lets only owners and admins edit the group and see the invite code', () => {
    expect(can('OWNER', 'group:edit')).toBe(true);
    expect(can('ADMIN', 'group:edit')).toBe(true);
    expect(can('MEMBER', 'group:edit')).toBe(false);
    expect(can('MEMBER', 'invite:view')).toBe(false);
    expect(can('ADMIN', 'invite:view')).toBe(true);
  });

  it('lets only the owner delete the group', () => {
    expect(can('OWNER', 'group:delete')).toBe(true);
    expect(can('ADMIN', 'group:delete')).toBe(false);
    expect(can('MEMBER', 'group:delete')).toBe(false);
  });

  it('denies anything it does not know about', () => {
    expect(can('OWNER', 'group:explode')).toBe(false);
    expect(can(undefined, 'group:view')).toBe(false);
    expect(can('SUPERUSER', 'group:view')).toBe(false);
  });
});