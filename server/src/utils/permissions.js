// The single source of truth for who may do what inside a group.
// Anything not listed here is denied.
const matrix = {
  'group:view': ['OWNER', 'ADMIN', 'MEMBER'],
  'group:edit': ['OWNER', 'ADMIN'],
  'group:delete': ['OWNER'],
  'invite:view': ['OWNER', 'ADMIN'],
};

export function can(role, action) {
  return Boolean(role) && (matrix[action] ?? []).includes(role);
}