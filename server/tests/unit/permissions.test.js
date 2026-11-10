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

  it('lets owners and admins manage invites and add or remove members', () => {
    for (const action of ['invite:manage', 'member:add', 'member:remove']) {
      expect(can('OWNER', action)).toBe(true);
      expect(can('ADMIN', action)).toBe(true);
      expect(can('MEMBER', action)).toBe(false);
    }
  });

  it('lets only the owner change roles', () => {
    expect(can('OWNER', 'member:set-role')).toBe(true);
    expect(can('ADMIN', 'member:set-role')).toBe(false);
    expect(can('MEMBER', 'member:set-role')).toBe(false);
  });

  it('lets every member leave', () => {
    for (const role of ['OWNER', 'ADMIN', 'MEMBER']) expect(can(role, 'group:leave')).toBe(true);
  });

  it('denies anything it does not know about', () => {
    expect(can('OWNER', 'group:explode')).toBe(false);
    expect(can(undefined, 'group:view')).toBe(false);
    expect(can('SUPERUSER', 'group:view')).toBe(false);
  });
});