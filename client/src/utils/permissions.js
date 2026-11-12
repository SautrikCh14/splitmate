// Mirrors the server's permission rules so the screen only offers what will work.
// This is a convenience, not security: the server checks every request again.
const matrix = {
  'group:edit': ['OWNER', 'ADMIN'],
  'group:delete': ['OWNER'],
  'invite:view': ['OWNER', 'ADMIN'],
  'invite:manage': ['OWNER', 'ADMIN'],
  'member:add': ['OWNER', 'ADMIN'],
  'member:remove': ['OWNER', 'ADMIN'],
  'member:set-role': ['OWNER'],
};

export function can(role, action) {
  return Boolean(role) && (matrix[action] ?? []).includes(role);
}

// The owner must hand over ownership before leaving.
export function canLeave(role) {
  return role === 'ADMIN' || role === 'MEMBER';
}

// What may the current user do to this particular member?
export function memberActions(myRole, myUserId, member) {
  if (member.userId === myUserId || member.role === 'OWNER') {
    return { canSetRole: false, canRemove: false };
  }
  return {
    canSetRole: can(myRole, 'member:set-role'),
    // Only the owner may remove an admin.
    canRemove: can(myRole, 'member:remove') && !(member.role === 'ADMIN' && myRole !== 'OWNER'),
  };
}