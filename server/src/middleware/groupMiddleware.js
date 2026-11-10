import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { can } from '../utils/permissions.js';

// Finds the logged-in user's membership in the group named by :id.
// A non-member gets "not found", never "forbidden", so the existence of other
// people's groups is not revealed.
export async function loadMembership(req, res, next) {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: req.user.id, groupId: req.params.id } },
  });
  if (!membership) throw new AppError(404, 'Group not found');

  req.membership = membership;
  next();
}

export function requirePermission(action) {
  return (req, res, next) => {
    if (!can(req.membership.role, action)) {
      throw new AppError(403, 'You do not have permission to do that');
    }
    next();
  };
}