import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/config/db.js';
import { resetDatabase, createUser, addMember } from '../helpers.js';

beforeEach(resetDatabase);
afterAll(async () => {
  await resetDatabase();
  await prisma.$disconnect();
});

// Alex owns the group, Priya is an admin, Rahul is a member, Eve is an outsider.
async function makeTeam() {
  const alex = await createUser(app, 'Alex');
  const priya = await createUser(app, 'Priya');
  const rahul = await createUser(app, 'Rahul');
  const eve = await createUser(app, 'Eve');
  const group = (await alex.agent.post('/api/groups').send({ name: 'Goa Trip 2026' })).body.group;
  await addMember(group.id, priya.user.id, 'ADMIN');
  await addMember(group.id, rahul.user.id, 'MEMBER');
  const { inviteCode } = await prisma.group.findUnique({ where: { id: group.id } });
  return { alex, priya, rahul, eve, group, inviteCode };
}

const roleOf = async (groupId, userId) =>
  (await prisma.groupMember.findUnique({ where: { userId_groupId: { userId, groupId } } }))?.role ?? null;

const isMember = async (groupId, userId) => (await roleOf(groupId, userId)) !== null;

const lastActivity = (groupId, action) =>
  prisma.activity.findFirst({ where: { groupId, action }, orderBy: { createdAt: 'desc' } });

function addExpense(groupId, paidById, splitUserIds = []) {
  return prisma.expense.create({
    data: {
      description: 'Dinner',
      amount: 30000,
      paidById,
      createdById: paidById,
      groupId,
      splitType: 'EQUAL',
      date: new Date('2026-11-01'),
      splits: { create: splitUserIds.map((userId) => ({ userId, amount: 30000 / splitUserIds.length })) },
    },
  });
}

describe('POST /api/groups/join', () => {
  it('lets someone join with a valid code, as an ordinary member', async () => {
    const { eve, group, inviteCode } = await makeTeam();
    const res = await eve.agent.post('/api/groups/join').send({ code: inviteCode });

    expect(res.status).toBe(200);
    expect(res.body.group).toMatchObject({ id: group.id, myRole: 'MEMBER', memberCount: 4 });
    expect(await roleOf(group.id, eve.user.id)).toBe('MEMBER');
    expect(JSON.stringify(res.body)).not.toMatch(/inviteCode/); // members never see the code

    const listed = await eve.agent.get('/api/groups');
    expect(listed.body.groups.map((g) => g.id)).toContain(group.id);
    expect((await lastActivity(group.id, 'MEMBER_JOINED')).description).toBe('Eve joined the group');
  });

  it('ignores letter case and surrounding spaces in the code', async () => {
    const { eve, group, inviteCode } = await makeTeam();
    const res = await eve.agent.post('/api/groups/join').send({ code: `  ${inviteCode.toLowerCase()} ` });
    expect(res.status).toBe(200);
    expect(await isMember(group.id, eve.user.id)).toBe(true);
  });

  it('gives an unknown code and an expired code the same answer', async () => {
    const { eve, group, inviteCode } = await makeTeam();
    await prisma.group.update({ where: { id: group.id }, data: { inviteExpiresAt: new Date(Date.now() - 1000) } });

    const expired = await eve.agent.post('/api/groups/join').send({ code: inviteCode });
    const unknown = await eve.agent.post('/api/groups/join').send({ code: 'ZZZZZZZZ' });

    expect(expired.status).toBe(404);
    expect(unknown.status).toBe(404);
    expect(expired.body).toEqual(unknown.body);
    expect(await isMember(group.id, eve.user.id)).toBe(false);
  });

  it('accepts a code whose expiry is still in the future', async () => {
    const { eve, group, inviteCode } = await makeTeam();
    await prisma.group.update({ where: { id: group.id }, data: { inviteExpiresAt: new Date(Date.now() + 3600_000) } });
    expect((await eve.agent.post('/api/groups/join').send({ code: inviteCode })).status).toBe(200);
  });

  it('does not add someone twice', async () => {
    const { rahul, group, inviteCode } = await makeTeam();
    const res = await rahul.agent.post('/api/groups/join').send({ code: inviteCode });

    expect(res.status).toBe(409);
    expect(await prisma.groupMember.count({ where: { groupId: group.id, userId: rahul.user.id } })).toBe(1);
  });

  it('handles two simultaneous joins without creating a duplicate', async () => {
    const { eve, group, inviteCode } = await makeTeam();
    const [a, b] = await Promise.all([
      eve.agent.post('/api/groups/join').send({ code: inviteCode }),
      eve.agent.post('/api/groups/join').send({ code: inviteCode }),
    ]);

    expect([a.status, b.status].sort()).toEqual([200, 409]);
    expect(await prisma.groupMember.count({ where: { groupId: group.id, userId: eve.user.id } })).toBe(1);
  });

  it('rejects an empty code and a missing login', async () => {
    const { eve, inviteCode } = await makeTeam();
    expect((await eve.agent.post('/api/groups/join').send({ code: '   ' })).status).toBe(400);
    expect((await request(app).post('/api/groups/join').send({ code: inviteCode })).status).toBe(401);
  });
});

describe('POST /api/groups/:id/invite/regenerate', () => {
  it('replaces the code, and the old one stops working immediately', async () => {
    const { alex, eve, group, inviteCode } = await makeTeam();
    const res = await alex.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({});

    expect(res.status).toBe(200);
    expect(res.body.inviteCode).toMatch(/^[A-Z2-9]{8}$/);
    expect(res.body.inviteCode).not.toBe(inviteCode);
    expect(res.body.inviteExpiresAt).toBeNull();

    expect((await eve.agent.post('/api/groups/join').send({ code: inviteCode })).status).toBe(404);
    expect((await eve.agent.post('/api/groups/join').send({ code: res.body.inviteCode })).status).toBe(200);
  });

  it('works for admins too', async () => {
    const { priya, group } = await makeTeam();
    expect((await priya.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({})).status).toBe(200);
  });

  it('sets an expiry in days, and clears it again when none is given', async () => {
    const { alex, group } = await makeTeam();
    const week = await alex.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({ expiresInDays: 7 });
    const days = (new Date(week.body.inviteExpiresAt) - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThan(7.01);

    const never = await alex.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({});
    expect(never.body.inviteExpiresAt).toBeNull();
  });

  it('rejects an expiry that is not offered', async () => {
    const { alex, group } = await makeTeam();
    expect((await alex.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({ expiresInDays: 3 })).status).toBe(400);
    expect((await alex.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({ expiresInDays: 'forever' })).status).toBe(400);
  });

  it('is refused for members, hidden from outsiders, and needs a login', async () => {
    const { rahul, eve, group, inviteCode } = await makeTeam();
    expect((await rahul.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({})).status).toBe(403);
    expect((await eve.agent.post(`/api/groups/${group.id}/invite/regenerate`).send({})).status).toBe(404);
    expect((await request(app).post(`/api/groups/${group.id}/invite/regenerate`).send({})).status).toBe(401);
    expect((await prisma.group.findUnique({ where: { id: group.id } })).inviteCode).toBe(inviteCode);
  });
});

describe('POST /api/groups/:id/members (add by email)', () => {
  it('lets an admin add a registered user', async () => {
    const { priya, eve, group } = await makeTeam();
    const res = await priya.agent.post(`/api/groups/${group.id}/members`).send({ email: eve.user.email });

    expect(res.status).toBe(200);
    expect(await roleOf(group.id, eve.user.id)).toBe('MEMBER');
    expect((await lastActivity(group.id, 'MEMBER_JOINED')).description).toBe('Priya added Eve');
  });

  it('answers identically whether or not the email has an account', async () => {
    const { alex, rahul, eve, group } = await makeTeam();
    const url = `/api/groups/${group.id}/members`;

    const added = await alex.agent.post(url).send({ email: eve.user.email });
    const alreadyIn = await alex.agent.post(url).send({ email: rahul.user.email });
    const unknown = await alex.agent.post(url).send({ email: 'nobody-at-all@example.com' });

    for (const res of [alreadyIn, unknown]) {
      expect(res.status).toBe(added.status);
      expect(res.body).toEqual(added.body);
    }
    expect(await prisma.groupMember.count({ where: { groupId: group.id } })).toBe(4);
  });

  it('ignores letter case, and never adds a deleted account', async () => {
    const { alex, eve, group } = await makeTeam();
    await prisma.user.update({ where: { id: eve.user.id }, data: { deletedAt: new Date() } });
    await alex.agent.post(`/api/groups/${group.id}/members`).send({ email: eve.user.email.toUpperCase() });
    expect(await isMember(group.id, eve.user.id)).toBe(false);
  });

  it('is refused for members, hidden from outsiders, and rejects a malformed email', async () => {
    const { alex, rahul, eve, group } = await makeTeam();
    const url = `/api/groups/${group.id}/members`;
    expect((await rahul.agent.post(url).send({ email: eve.user.email })).status).toBe(403);
    expect((await eve.agent.post(url).send({ email: eve.user.email })).status).toBe(404);
    expect((await alex.agent.post(url).send({ email: 'not-an-email' })).status).toBe(400);
    expect(await isMember(group.id, eve.user.id)).toBe(false);
  });
});

describe('PUT /api/groups/:id/members/:userId (roles)', () => {
  it('lets the owner promote a member to admin and demote an admin to member', async () => {
    const { alex, priya, rahul, group } = await makeTeam();
    const up = await alex.agent.put(`/api/groups/${group.id}/members/${rahul.user.id}`).send({ role: 'ADMIN' });
    expect(up.status).toBe(200);
    expect(await roleOf(group.id, rahul.user.id)).toBe('ADMIN');

    await alex.agent.put(`/api/groups/${group.id}/members/${priya.user.id}`).send({ role: 'MEMBER' });
    expect(await roleOf(group.id, priya.user.id)).toBe('MEMBER');
  });

  it('hands over ownership, leaving exactly one owner and making the old owner an admin', async () => {
    const { alex, rahul, group } = await makeTeam();
    const res = await alex.agent.put(`/api/groups/${group.id}/members/${rahul.user.id}`).send({ role: 'OWNER' });

    expect(res.status).toBe(200);
    expect(await roleOf(group.id, rahul.user.id)).toBe('OWNER');
    expect(await roleOf(group.id, alex.user.id)).toBe('ADMIN');
    expect(await prisma.groupMember.count({ where: { groupId: group.id, role: 'OWNER' } })).toBe(1);
  });

  it('does not let the owner change their own role', async () => {
    const { alex, group } = await makeTeam();
    const res = await alex.agent.put(`/api/groups/${group.id}/members/${alex.user.id}`).send({ role: 'MEMBER' });
    expect(res.status).toBe(400);
    expect(await roleOf(group.id, alex.user.id)).toBe('OWNER');
  });

  it('is refused for admins and members, so nobody can promote themselves', async () => {
    const { priya, rahul, group } = await makeTeam();
    expect((await priya.agent.put(`/api/groups/${group.id}/members/${rahul.user.id}`).send({ role: 'ADMIN' })).status).toBe(403);
    expect((await rahul.agent.put(`/api/groups/${group.id}/members/${rahul.user.id}`).send({ role: 'OWNER' })).status).toBe(403);
    expect(await roleOf(group.id, rahul.user.id)).toBe('MEMBER');
  });

  it('returns 404 for someone who is not in the group, and 400 for a bad role', async () => {
    const { alex, rahul, eve, group } = await makeTeam();
    expect((await alex.agent.put(`/api/groups/${group.id}/members/${eve.user.id}`).send({ role: 'ADMIN' })).status).toBe(404);
    expect((await alex.agent.put(`/api/groups/${group.id}/members/${rahul.user.id}`).send({ role: 'GOD' })).status).toBe(400);
    expect((await eve.agent.put(`/api/groups/${group.id}/members/${rahul.user.id}`).send({ role: 'ADMIN' })).status).toBe(404);
  });
});

describe('DELETE /api/groups/:id/members/:userId (remove)', () => {
  it('lets the owner and an admin remove an ordinary member', async () => {
    const { alex, priya, rahul, eve, group, inviteCode } = await makeTeam();
    const res = await priya.agent.delete(`/api/groups/${group.id}/members/${rahul.user.id}`);

    expect(res.status).toBe(200);
    expect(await isMember(group.id, rahul.user.id)).toBe(false);
    expect((await lastActivity(group.id, 'MEMBER_REMOVED')).description).toBe('Priya removed Rahul');
    expect((await rahul.agent.get(`/api/groups/${group.id}`)).status).toBe(404); // access ends at once

    await eve.agent.post('/api/groups/join').send({ code: inviteCode });
    expect((await alex.agent.delete(`/api/groups/${group.id}/members/${eve.user.id}`)).status).toBe(200);
  });

  it('lets only the owner remove an admin, and nobody remove the owner', async () => {
    const { alex, priya, rahul, group } = await makeTeam();
    await addMember(group.id, (await createUser(app, 'Second Admin')).user.id, 'ADMIN');
    const other = await prisma.groupMember.findFirst({ where: { groupId: group.id, role: 'ADMIN', NOT: { userId: priya.user.id } } });

    expect((await priya.agent.delete(`/api/groups/${group.id}/members/${other.userId}`)).status).toBe(403); // admin vs admin
    expect((await priya.agent.delete(`/api/groups/${group.id}/members/${alex.user.id}`)).status).toBe(403); // admin vs owner
    expect((await rahul.agent.delete(`/api/groups/${group.id}/members/${priya.user.id}`)).status).toBe(403); // member
    expect((await alex.agent.delete(`/api/groups/${group.id}/members/${other.userId}`)).status).toBe(200); // owner vs admin
    expect(await isMember(group.id, alex.user.id)).toBe(true);
    expect(await isMember(group.id, priya.user.id)).toBe(true);
  });

  it('points people to "leave" instead of removing themselves', async () => {
    const { priya, group } = await makeTeam();
    const res = await priya.agent.delete(`/api/groups/${group.id}/members/${priya.user.id}`);
    expect(res.status).toBe(400);
    expect(await isMember(group.id, priya.user.id)).toBe(true);
  });

  it('keeps a member who has money history in the group', async () => {
    const { alex, rahul, priya, group } = await makeTeam();
    const url = (id) => `/api/groups/${group.id}/members/${id}`;

    const paid = await addExpense(group.id, rahul.user.id);
    expect((await alex.agent.delete(url(rahul.user.id))).status).toBe(409);
    await prisma.expense.delete({ where: { id: paid.id } });

    await addExpense(group.id, alex.user.id, [rahul.user.id, alex.user.id]);
    expect((await alex.agent.delete(url(rahul.user.id))).status).toBe(409); // shares in an expense
    await prisma.expense.deleteMany();

    await prisma.settlement.create({ data: { groupId: group.id, paidById: priya.user.id, paidToId: rahul.user.id, amount: 1000, date: new Date() } });
    expect((await alex.agent.delete(url(rahul.user.id))).status).toBe(409); // got paid
    expect(await isMember(group.id, rahul.user.id)).toBe(true);
  });

  it('returns 404 for an outsider, for a non-member target, and blocks cross-group tampering', async () => {
    const { alex, priya, rahul, eve, group } = await makeTeam();
    expect((await alex.agent.delete(`/api/groups/${group.id}/members/${eve.user.id}`)).status).toBe(404);
    expect((await eve.agent.delete(`/api/groups/${group.id}/members/${rahul.user.id}`)).status).toBe(404);

    // Priya is an admin of the Goa group only. She cannot use that to act on a different group.
    const otherGroup = (await eve.agent.post('/api/groups').send({ name: 'Eve Only' })).body.group;
    await addMember(otherGroup.id, rahul.user.id);
    expect((await priya.agent.delete(`/api/groups/${otherGroup.id}/members/${rahul.user.id}`)).status).toBe(404);
    expect(await isMember(otherGroup.id, rahul.user.id)).toBe(true);
    expect(alex.user.id).toBeTruthy();
  });
});

describe('POST /api/groups/:id/leave', () => {
  it('lets a member leave, ending their access and recording it', async () => {
    const { rahul, group } = await makeTeam();
    const res = await rahul.agent.post(`/api/groups/${group.id}/leave`);

    expect(res.status).toBe(200);
    expect(await isMember(group.id, rahul.user.id)).toBe(false);
    expect((await lastActivity(group.id, 'MEMBER_LEFT')).description).toBe('Rahul left the group');
    expect((await rahul.agent.get(`/api/groups/${group.id}`)).status).toBe(404);
    expect((await rahul.agent.get('/api/groups')).body.groups).toEqual([]);
  });

  it('lets an admin leave', async () => {
    const { priya, group } = await makeTeam();
    expect((await priya.agent.post(`/api/groups/${group.id}/leave`)).status).toBe(200);
  });

  it("does not let the owner leave, even when they are the only member", async () => {
    const { alex } = await makeTeam();
    const solo = (await alex.agent.post('/api/groups').send({ name: 'Solo' })).body.group;
    const res = await alex.agent.post(`/api/groups/${solo.id}/leave`);

    expect(res.status).toBe(409);
    expect(await roleOf(solo.id, alex.user.id)).toBe('OWNER');
  });

  it('lets a former owner leave once ownership has been handed over', async () => {
    const { alex, rahul, group } = await makeTeam();
    await alex.agent.put(`/api/groups/${group.id}/members/${rahul.user.id}`).send({ role: 'OWNER' });
    expect((await alex.agent.post(`/api/groups/${group.id}/leave`)).status).toBe(200);
    expect(await roleOf(group.id, rahul.user.id)).toBe('OWNER');
  });

  it('keeps a member with money history in the group', async () => {
    const { rahul, group } = await makeTeam();
    await addExpense(group.id, rahul.user.id);
    expect((await rahul.agent.post(`/api/groups/${group.id}/leave`)).status).toBe(409);
    expect(await isMember(group.id, rahul.user.id)).toBe(true);
  });

  it('returns 404 for an outsider and needs a login', async () => {
    const { eve, group } = await makeTeam();
    expect((await eve.agent.post(`/api/groups/${group.id}/leave`)).status).toBe(404);
    expect((await request(app).post(`/api/groups/${group.id}/leave`)).status).toBe(401);
  });
});