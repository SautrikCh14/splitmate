import bcrypt from 'bcrypt';
import request from 'supertest';
import { prisma } from '../src/config/db.js';

// Groups must go before users (users cannot be deleted while groups point at them).
// Deleting a group also removes its members, expenses, payments and activity.
export async function resetDatabase() {
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
}

// A cheap hash (4 rounds instead of the real 12) keeps tests fast. The real
// registration path, including 12 rounds, is covered in auth.test.js.
const TEST_PASSWORD = 'test-password-123';
const TEST_HASH = bcrypt.hashSync(TEST_PASSWORD, 4);

let counter = 0;

// Creates a user directly in the database and returns a logged-in supertest agent.
export async function createUser(app, name = 'Test User') {
  counter += 1;
  const email = `user${counter}@example.com`;
  const user = await prisma.user.create({ data: { name, email, passwordHash: TEST_HASH } });

  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password: TEST_PASSWORD });
  return { agent, user };
}

export function addMember(groupId, userId, role = 'MEMBER') {
  return prisma.groupMember.create({ data: { groupId, userId, role } });
}