import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { can } from '../utils/permissions.js';
import { generateInviteCode } from '../utils/generateInviteCode.js';

const MAX_CODE_ATTEMPTS = 5;

function toGroupSummary(group, { role, memberCount, totalExpenses }) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    icon: group.icon,
    currency: group.currency,
    myRole: role,
    memberCount,
    totalExpenses, // integer paise
    createdAt: group.createdAt,
  };
}

async function getTotalExpenses(groupId) {
  const result = await prisma.expense.aggregate({ where: { groupId }, _sum: { amount: true } });
  return result._sum.amount ?? 0;
}

export async function createGroup(userId, { name, description, icon, currency }) {
  // The group, its owner membership and the first activity entry are created together
  // in one database operation: either all of them exist afterwards, or none do.
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    try {
      const group = await prisma.group.create({
        data: {
          name,
          description,
          icon,
          currency,
          inviteCode: generateInviteCode(),
          createdById: userId,
          members: { create: { userId, role: 'OWNER' } },
          activities: {
            create: {
              userId,
              action: 'GROUP_CREATED',
              description: `Created the group "${name}"`,
              metadata: { groupName: name },
            },
          },
        },
      });
      return toGroupSummary(group, { role: 'OWNER', memberCount: 1, totalExpenses: 0 });
    } catch (error) {
      // The only unique value besides the id is the invite code: on a clash, try a new one.
      if (error.code !== 'P2002') throw error;
    }
  }
  throw new Error('Could not generate a unique invite code');
}

export async function listGroups(userId) {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: { group: { include: { _count: { select: { members: true } } } } },
    orderBy: { group: { createdAt: 'desc' } },
  });

  const groupIds = memberships.map((membership) => membership.groupId);
  const sums = groupIds.length
    ? await prisma.expense.groupBy({
        by: ['groupId'],
        where: { groupId: { in: groupIds } },
        _sum: { amount: true },
      })
    : [];
  const totals = new Map(sums.map((row) => [row.groupId, row._sum.amount ?? 0]));

  return memberships.map((membership) =>
    toGroupSummary(membership.group, {
      role: membership.role,
      memberCount: membership.group._count.members,
      totalExpenses: totals.get(membership.groupId) ?? 0,
    })
  );
}

export async function getGroupDetails(groupId, membership) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        orderBy: { joinedAt: 'asc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });
  if (!group) throw new AppError(404, 'Group not found');

  const summary = toGroupSummary(group, {
    role: membership.role,
    memberCount: group.members.length,
    totalExpenses: await getTotalExpenses(groupId),
  });

  return {
    ...summary,
    // Emails are deliberately not shared between members.
    members: group.members.map((member) => ({
      userId: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      role: member.role,
      joinedAt: member.joinedAt,
    })),
    // Only people who may invite can see the code.
    ...(can(membership.role, 'invite:view') && {
      inviteCode: group.inviteCode,
      inviteExpiresAt: group.inviteExpiresAt,
    }),
  };
}

export async function updateGroup(groupId, data, membership) {
  const group = await prisma.group.update({ where: { id: groupId }, data });
  const memberCount = await prisma.groupMember.count({ where: { groupId } });

  return toGroupSummary(group, {
    role: membership.role,
    memberCount,
    totalExpenses: await getTotalExpenses(groupId),
  });
}

export async function deleteGroup(groupId) {
  // Deleting a group erases its expenses and payments for everyone. Until the balance
  // engine exists (Phase 7), the safe rule is: only a group with no money records can go.
  const [expenseCount, settlementCount] = await Promise.all([
    prisma.expense.count({ where: { groupId } }),
    prisma.settlement.count({ where: { groupId } }),
  ]);
  if (expenseCount > 0 || settlementCount > 0) {
    throw new AppError(409, 'This group has expenses or payments recorded, so it cannot be deleted yet.');
  }

  await prisma.group.delete({ where: { id: groupId } });
}