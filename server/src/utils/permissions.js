// The single source of truth for who may do what inside a group.
// Anything not listed here is denied.
const matrix = {
  'group:view': ['OWNER', 'ADMIN', 'MEMBER'],
  'group:edit': ['OWNER', 'ADMIN'],
  'group:delete': ['OWNER'],
  'group:leave': ['OWNER', 'ADMIN', 'MEMBER'],
  'invite:view': ['OWNER', 'ADMIN'],
  'invite:manage': ['OWNER', 'ADMIN'],
  'member:add': ['OWNER', 'ADMIN'],
  'member:remove': ['OWNER', 'ADMIN'],
  'member:set-role': ['OWNER'],
};

export function can(role, action) {
  return Boolean(role) && (matrix[action] ?? []).includes(role);
}