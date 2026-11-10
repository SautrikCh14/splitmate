import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { generateInviteCode } from '../utils/generateInviteCode.js';

const MAX_CODE_ATTEMPTS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

function memberKey(userId, groupId) {
  return { userId_groupId: { userId, groupId } };
}

// Has this person paid for, shared in, or exchanged money with anyone in this group?
// Until balances exist (Phase 7), that history is what stops a member from leaving or being
// removed: doing so could leave other people's balances unexplained.
async function hasMoneyActivity(groupId, userId) {
  const [paid, shared, settled] = await Promise.all([
    prisma.expense.count({ where: { groupId, paidById: userId } }),
    prisma.expenseSplit.count({ where: { userId, expense: { groupId } } }),
    prisma.settlement.count({ where: { groupId, OR: [{ paidById: userId }, { paidToId: userId }] } }),
  ]);
  return paid + shared + settled > 0;
}

// ---------- invite codes ----------

export async function regenerateInvite(groupId, { expiresInDays } = {}) {
  const inviteExpiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * DAY_MS) : null;

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    try {
      // The old code stops working the moment this update commits.
      return await prisma.group.update({
        where: { id: groupId },
        data: { inviteCode: generateInviteCode(), inviteExpiresAt },
        select: { inviteCode: true, inviteExpiresAt: true },
      });
    } catch (error) {
      if (error.code !== 'P2002') throw error;
    }
  }
  throw new Error('Could not generate a unique invite code');
}

export async function joinGroup(user, code) {
  const group = await prisma.group.findUnique({ where: { inviteCode: code } });

  // Unknown and expired codes get the same answer on purpose.
  if (!group || (group.inviteExpiresAt && group.inviteExpiresAt <= new Date())) {
    throw new AppError(404, 'Invalid or expired invite code');
  }

  try {
    const [membership] = await prisma.$transaction([
      prisma.groupMember.create({ data: { groupId: group.id, userId: user.id, role: 'MEMBER' } }),
      prisma.activity.create({
        data: {
          groupId: group.id,
          userId: user.id,
          action: 'MEMBER_JOINED',
          description: `${user.name} joined the group`,
          metadata: { userId: user.id, userName: user.name },
        },
      }),
    ]);
    return { groupId: group.id, membership };
  } catch (error) {
    // The (user, group) pair is unique, so a repeat join, even a simultaneous one, lands here.
    if (error.code === 'P2002') throw new AppError(409, 'You are already a member of this group');
    throw error;
  }
}

// ---------- members ----------

// Always "succeeds" without saying whether the email belongs to anyone,
// so this cannot be used to find out who has an account.
export async function addMemberByEmail(actor, groupId, email) {
  const target = await prisma.user.findUnique({ where: { email } });
  if (!target || target.deletedAt) return;

  try {
    await prisma.$transaction([
      prisma.groupMember.create({ data: { groupId, userId: target.id, role: 'MEMBER' } }),
      prisma.activity.create({
        data: {
          groupId,
          userId: actor.id,
          action: 'MEMBER_JOINED',
          description: `${actor.name} added ${target.name}`,
          metadata: { userId: target.id, userName: target.name, addedBy: actor.id },
        },
      }),
    ]);
  } catch (error) {
    if (error.code !== 'P2002') throw error; // already a member: same outcome as success
  }
}

export async function setMemberRole(actor, actorMembership, groupId, targetUserId, role) {
  if (targetUserId === actor.id) {
    throw new AppError(400, "You can't change your own role. To hand over ownership, make someone else the owner.");
  }

  const target = await prisma.groupMember.findUnique({ where: memberKey(targetUserId, groupId) });
  if (!target) throw new AppError(404, 'Member not found');

  if (role === 'OWNER') {
    // Handing over ownership: both changes happen together, so there is never no owner.
    await prisma.$transaction([
      prisma.groupMember.update({ where: { id: target.id }, data: { role: 'OWNER' } }),
      prisma.groupMember.update({ where: { id: actorMembership.id }, data: { role: 'ADMIN' } }),
    ]);
  } else {
    await prisma.groupMember.update({ where: { id: target.id }, data: { role } });
  }
  return { userId: targetUserId, role };
}

export async function removeMember(actor, actorMembership, groupId, targetUserId) {
  if (targetUserId === actor.id) {
    throw new AppError(400, 'Use "Leave group" to remove yourself.');
  }

  const target = await prisma.groupMember.findUnique({
    where: memberKey(targetUserId, groupId),
    include: { user: { select: { name: true } } },
  });
  if (!target) throw new AppError(404, 'Member not found');

  if (target.role === 'OWNER') throw new AppError(403, "The group owner can't be removed");
  if (target.role === 'ADMIN' && actorMembership.role !== 'OWNER') {
    throw new AppError(403, 'Only the owner can remove an admin');
  }
  if (await hasMoneyActivity(groupId, targetUserId)) {
    throw new AppError(409, 'This member has expenses or payments in the group, so they cannot be removed yet.');
  }

  await prisma.$transaction([
    prisma.groupMember.delete({ where: { id: target.id } }),
    prisma.activity.create({
      data: {
        groupId,
        userId: actor.id,
        action: 'MEMBER_REMOVED',
        description: `${actor.name} removed ${target.user.name}`,
        metadata: { userId: targetUserId, userName: target.user.name, removedBy: actor.id },
      },
    }),
  ]);
}

export async function leaveGroup(user, membership) {
  if (membership.role === 'OWNER') {
    throw new AppError(409, "The owner can't leave. Hand over ownership to someone else, or delete the group.");
  }
  if (await hasMoneyActivity(membership.groupId, user.id)) {
    throw new AppError(409, 'You have expenses or payments in this group, so you cannot leave yet.');
  }

  await prisma.$transaction([
    prisma.groupMember.delete({ where: { id: membership.id } }),
    prisma.activity.create({
      data: {
        groupId: membership.groupId,
        userId: user.id,
        action: 'MEMBER_LEFT',
        description: `${user.name} left the group`,
        metadata: { userId: user.id, userName: user.name },
      },
    }),
  ]);
}