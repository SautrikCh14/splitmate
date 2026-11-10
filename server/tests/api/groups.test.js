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

async function makeGroup(agent, overrides = {}) {
  const res = await agent.post('/api/groups').send({ name: 'Goa Trip 2026', ...overrides });
  return res.body.group;
}

describe('POST /api/groups', () => {
  it('creates a group and makes the creator its owner', async () => {
    const { agent, user } = await createUser(app, 'Alex');
    const res = await agent.post('/api/groups').send({ name: '  Goa Trip 2026 ', description: 'Beach week', icon: 'plane' });

    expect(res.status).toBe(201);
    expect(res.body.group).toMatchObject({
      name: 'Goa Trip 2026', // trimmed
      description: 'Beach week',
      icon: 'plane',
      currency: 'INR', // default
      myRole: 'OWNER',
      memberCount: 1,
      totalExpenses: 0,
    });

    const membership = await prisma.groupMember.findFirst({ where: { groupId: res.body.group.id } });
    expect(membership).toMatchObject({ userId: user.id, role: 'OWNER' });
  });

  it('applies defaults for icon and currency', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    expect(group.icon).toBe('users');
    expect(group.currency).toBe('INR');
  });

  it('records a "group created" activity entry', async () => {
    const { agent, user } = await createUser(app);
    const group = await makeGroup(agent);
    const activity = await prisma.activity.findMany({ where: { groupId: group.id } });

    expect(activity).toHaveLength(1);
    expect(activity[0]).toMatchObject({ action: 'GROUP_CREATED', userId: user.id });
  });

  it('gives every group its own invite code, never shown to the public list', async () => {
    const { agent } = await createUser(app);
    const a = await makeGroup(agent, { name: 'Group A' });
    const b = await makeGroup(agent, { name: 'Group B' });
    const codes = (await prisma.group.findMany()).map((g) => g.inviteCode);

    expect(new Set(codes).size).toBe(2);
    expect(JSON.stringify(a)).not.toMatch(/inviteCode/);
    expect(JSON.stringify(b)).not.toMatch(/inviteCode/);
  });

  it('turns an empty description into null', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent, { description: '   ' });
    expect(group.description).toBeNull();
  });

  it('rejects bad input with per-field messages', async () => {
    const { agent } = await createUser(app);
    const res = await agent.post('/api/groups').send({ name: 'A', icon: 'rocket', currency: 'JPY', description: 'x'.repeat(201) });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(['currency', 'description', 'icon', 'name']);
    expect(await prisma.group.count()).toBe(0);
  });

  it('requires login', async () => {
    const res = await request(app).post('/api/groups').send({ name: 'Sneaky' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/groups', () => {
  it('lists only the groups the user belongs to', async () => {
    const alex = await createUser(app, 'Alex');
    const rahul = await createUser(app, 'Rahul');
    await makeGroup(alex.agent, { name: 'Alex only' });
    const shared = await makeGroup(rahul.agent, { name: 'Rahul and Alex' });
    await makeGroup(rahul.agent, { name: 'Rahul only' });
    await addMember(shared.id, alex.user.id);

    const res = await alex.agent.get('/api/groups');
    expect(res.status).toBe(200);
    expect(res.body.groups.map((g) => g.name).sort()).toEqual(['Alex only', 'Rahul and Alex']);

    const rahulsShared = res.body.groups.find((g) => g.name === 'Rahul and Alex');
    expect(rahulsShared).toMatchObject({ myRole: 'MEMBER', memberCount: 2 });
  });

  it('returns an empty list for a new user', async () => {
    const { agent } = await createUser(app);
    const res = await agent.get('/api/groups');
    expect(res.body.groups).toEqual([]);
  });

  it('adds up the total expenses of each group in paise', async () => {
    const { agent, user } = await createUser(app);
    const group = await makeGroup(agent);
    for (const amount of [150050, 90000]) {
      await prisma.expense.create({
        data: { description: 'Dinner', amount, paidById: user.id, createdById: user.id, groupId: group.id, splitType: 'EQUAL', date: new Date('2026-11-01') },
      });
    }
    const res = await agent.get('/api/groups');
    expect(res.body.groups[0].totalExpenses).toBe(240050);
  });

  it('requires login', async () => {
    expect((await request(app).get('/api/groups')).status).toBe(401);
  });
});

describe('GET /api/groups/:id', () => {
  it('shows members and the invite code to the owner', async () => {
    const alex = await createUser(app, 'Alex');
    const rahul = await createUser(app, 'Rahul');
    const group = await makeGroup(alex.agent);
    await addMember(group.id, rahul.user.id);

    const res = await alex.agent.get(`/api/groups/${group.id}`);
    expect(res.status).toBe(200);
    expect(res.body.group.members.map((m) => [m.name, m.role])).toEqual([['Alex', 'OWNER'], ['Rahul', 'MEMBER']]);
    expect(res.body.group.inviteCode).toMatch(/^[A-Z2-9]{8}$/);
  });

  it('hides the invite code from ordinary members', async () => {
    const alex = await createUser(app, 'Alex');
    const rahul = await createUser(app, 'Rahul');
    const group = await makeGroup(alex.agent);
    await addMember(group.id, rahul.user.id);

    const res = await rahul.agent.get(`/api/groups/${group.id}`);
    expect(res.status).toBe(200);
    expect(res.body.group.myRole).toBe('MEMBER');
    expect(JSON.stringify(res.body)).not.toMatch(/inviteCode/);
  });

  it('shows the invite code to admins', async () => {
    const alex = await createUser(app, 'Alex');
    const priya = await createUser(app, 'Priya');
    const group = await makeGroup(alex.agent);
    await addMember(group.id, priya.user.id, 'ADMIN');

    const res = await priya.agent.get(`/api/groups/${group.id}`);
    expect(res.body.group.inviteCode).toBeTruthy();
  });

  it('never exposes emails or password hashes', async () => {
    const alex = await createUser(app, 'Alex');
    const rahul = await createUser(app, 'Rahul');
    const group = await makeGroup(alex.agent);
    await addMember(group.id, rahul.user.id);

    const text = JSON.stringify((await rahul.agent.get(`/api/groups/${group.id}`)).body);
    expect(text).not.toMatch(/@example\.com/);
    expect(text).not.toMatch(/passwordHash|\$2[aby]\$/);
  });

  it('treats a non-member exactly like a group that does not exist', async () => {
    const alex = await createUser(app, 'Alex');
    const stranger = await createUser(app, 'Stranger');
    const group = await makeGroup(alex.agent);

    const real = await stranger.agent.get(`/api/groups/${group.id}`);
    const fake = await stranger.agent.get('/api/groups/does-not-exist');
    expect(real.status).toBe(404);
    expect(fake.status).toBe(404);
    expect(real.body).toEqual(fake.body);
  });

  it('requires login', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    expect((await request(app).get(`/api/groups/${group.id}`)).status).toBe(401);
  });
});

describe('PUT /api/groups/:id', () => {
  it('lets the owner edit name, description and icon', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    const res = await agent.put(`/api/groups/${group.id}`).send({ name: 'Goa 2027', description: 'Again!', icon: 'heart' });

    expect(res.status).toBe(200);
    expect(res.body.group).toMatchObject({ name: 'Goa 2027', description: 'Again!', icon: 'heart', myRole: 'OWNER' });
  });

  it('can clear the description', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent, { description: 'Old text' });
    const res = await agent.put(`/api/groups/${group.id}`).send({ description: '' });
    expect(res.body.group.description).toBeNull();
  });

  it('lets an admin edit but not an ordinary member', async () => {
    const alex = await createUser(app, 'Alex');
    const priya = await createUser(app, 'Priya');
    const rahul = await createUser(app, 'Rahul');
    const group = await makeGroup(alex.agent);
    await addMember(group.id, priya.user.id, 'ADMIN');
    await addMember(group.id, rahul.user.id, 'MEMBER');

    expect((await priya.agent.put(`/api/groups/${group.id}`).send({ name: 'By admin' })).status).toBe(200);

    const denied = await rahul.agent.put(`/api/groups/${group.id}`).send({ name: 'By member' });
    expect(denied.status).toBe(403);
    expect((await prisma.group.findUnique({ where: { id: group.id } })).name).toBe('By admin');
  });

  it('cannot be used by a stranger, and leaves the group untouched', async () => {
    const alex = await createUser(app, 'Alex');
    const stranger = await createUser(app, 'Stranger');
    const group = await makeGroup(alex.agent);

    const res = await stranger.agent.put(`/api/groups/${group.id}`).send({ name: 'Hijacked' });
    expect(res.status).toBe(404);
    expect((await prisma.group.findUnique({ where: { id: group.id } })).name).toBe('Goa Trip 2026');
  });

  it('refuses to change the currency', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    const res = await agent.put(`/api/groups/${group.id}`).send({ currency: 'USD' });

    expect(res.status).toBe(400);
    expect((await prisma.group.findUnique({ where: { id: group.id } })).currency).toBe('INR');
  });

  it('refuses attempts to rewrite the invite code or the creator', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    const before = await prisma.group.findUnique({ where: { id: group.id } });

    expect((await agent.put(`/api/groups/${group.id}`).send({ inviteCode: 'AAAAAAAA' })).status).toBe(400);
    expect((await agent.put(`/api/groups/${group.id}`).send({ createdById: 'someone-else' })).status).toBe(400);

    const after = await prisma.group.findUnique({ where: { id: group.id } });
    expect(after.inviteCode).toBe(before.inviteCode);
    expect(after.createdById).toBe(before.createdById);
  });

  it('rejects a valid change that is bundled with a forbidden field, and applies nothing', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    const before = await prisma.group.findUnique({ where: { id: group.id } });

    const withCurrency = await agent.put(`/api/groups/${group.id}`).send({ name: 'Renamed', currency: 'USD' });
    const withCode = await agent.put(`/api/groups/${group.id}`).send({ name: 'Renamed', inviteCode: 'AAAAAAAA' });

    expect(withCurrency.status).toBe(400);
    expect(withCode.status).toBe(400);
    const after = await prisma.group.findUnique({ where: { id: group.id } });
    expect(after).toMatchObject({ name: before.name, currency: 'INR', inviteCode: before.inviteCode });
  });

  it('rejects an empty update and an invalid name', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    expect((await agent.put(`/api/groups/${group.id}`).send({})).status).toBe(400);
    expect((await agent.put(`/api/groups/${group.id}`).send({ name: 'x' })).status).toBe(400);
  });
});

describe('DELETE /api/groups/:id', () => {
  it('lets the owner delete an empty group, and removes everything attached to it', async () => {
    const { agent } = await createUser(app);
    const group = await makeGroup(agent);
    const res = await agent.delete(`/api/groups/${group.id}`);

    expect(res.status).toBe(200);
    expect(await prisma.group.count()).toBe(0);
    expect(await prisma.groupMember.count()).toBe(0);
    expect(await prisma.activity.count()).toBe(0);
    expect((await agent.get(`/api/groups/${group.id}`)).status).toBe(404);
  });

  it('does not let an admin or a member delete the group', async () => {
    const alex = await createUser(app, 'Alex');
    const priya = await createUser(app, 'Priya');
    const rahul = await createUser(app, 'Rahul');
    const group = await makeGroup(alex.agent);
    await addMember(group.id, priya.user.id, 'ADMIN');
    await addMember(group.id, rahul.user.id, 'MEMBER');

    expect((await priya.agent.delete(`/api/groups/${group.id}`)).status).toBe(403);
    expect((await rahul.agent.delete(`/api/groups/${group.id}`)).status).toBe(403);
    expect(await prisma.group.count()).toBe(1);
  });

  it('does not let a stranger delete it', async () => {
    const alex = await createUser(app, 'Alex');
    const stranger = await createUser(app, 'Stranger');
    const group = await makeGroup(alex.agent);

    expect((await stranger.agent.delete(`/api/groups/${group.id}`)).status).toBe(404);
    expect(await prisma.group.count()).toBe(1);
  });

  it('refuses to delete a group that has expenses', async () => {
    const { agent, user } = await createUser(app);
    const group = await makeGroup(agent);
    await prisma.expense.create({
      data: { description: 'Dinner', amount: 50000, paidById: user.id, createdById: user.id, groupId: group.id, splitType: 'EQUAL', date: new Date('2026-11-01') },
    });

    const res = await agent.delete(`/api/groups/${group.id}`);
    expect(res.status).toBe(409);
    expect(await prisma.group.count()).toBe(1);
    expect(await prisma.expense.count()).toBe(1);
  });
});