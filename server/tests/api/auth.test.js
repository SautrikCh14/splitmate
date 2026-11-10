import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import { prisma } from '../../src/config/db.js';
import { env } from '../../src/config/env.js';
import { resetDatabase } from '../helpers.js';

const validUser = {
  name: 'Alex Sharma',
  email: 'alex@example.com',
  password: 'correct-horse-battery',
  confirmPassword: 'correct-horse-battery',
};

const cookieHeader = (res) => res.headers['set-cookie']?.find((c) => c.startsWith('splitmate_token='));

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('creates an account, returns the user and sets a secure cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Alex Sharma', email: 'alex@example.com' });
    expect(res.body.user.id).toBeTruthy();

    const cookie = cookieHeader(res);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).not.toMatch(/Max-Age|Expires/i); // session cookie by default
  });

  it('never exposes the password or its hash', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    const text = JSON.stringify(res.body);

    expect(text).not.toMatch(/passwordHash/);
    expect(text).not.toMatch(/correct-horse-battery/);
    expect(text).not.toMatch(/\$2[aby]\$/);
  });

  it('stores a bcrypt hash, not the password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const stored = await prisma.user.findUnique({ where: { email: 'alex@example.com' } });

    expect(stored.passwordHash).not.toBe(validUser.password);
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('lowercases and trims the email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: '  Alex@Example.COM ' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('alex@example.com');
  });

  it('rejects a duplicate email, even in a different case', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'ALEX@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.errors.email).toBeTruthy();
    expect(await prisma.user.count()).toBe(1);
  });

  it('rejects invalid input with per-field messages', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: 'short', confirmPassword: 'other' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors).toHaveProperty('email');
    expect(res.body.errors).toHaveProperty('password');
    expect(res.body.errors).toHaveProperty('confirmPassword');
    expect(await prisma.user.count()).toBe(0);
  });

  it('rejects mismatched passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, confirmPassword: 'something-else-entirely' });

    expect(res.status).toBe(400);
    expect(res.body.errors.confirmPassword).toBe('Passwords do not match');
  });

  it('rejects a password longer than 72 bytes', async () => {
    const long = 'x'.repeat(73);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: long, confirmPassword: long });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('password');
  });

  it('rejects a missing body', async () => {
    const res = await request(app).post('/api/auth/register').send();
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@example.com', password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alex@example.com');
    expect(cookieHeader(res)).toMatch(/HttpOnly/i);
  });

  it('accepts the email in a different case', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ALEX@EXAMPLE.COM', password: validUser.password });
    expect(res.status).toBe(200);
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@example.com', password: 'wrong-password-123' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong-password-123' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
    expect(cookieHeader(wrongPassword)).toBeUndefined();
  });

  it('sets a 30-day cookie when "remember me" is on', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@example.com', password: validUser.password, remember: true });

    expect(cookieHeader(res)).toMatch(/Max-Age=2592000/);
  });

  it('refuses to log in a deleted account', async () => {
    await prisma.user.update({ where: { email: 'alex@example.com' }, data: { deletedAt: new Date() } });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@example.com', password: validUser.password });
    expect(res.status).toBe(401);
  });
});

describe('protected routes, GET /api/auth/me', () => {
  it('rejects a request with no cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the user for a logged-in session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(validUser);
    const res = await agent.get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alex@example.com');
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  it('rejects a forged token signed with the wrong secret', async () => {
    const created = await request(app).post('/api/auth/register').send(validUser);
    const forged = jwt.sign({}, 'a-completely-different-secret-value-1234', {
      subject: created.body.user.id,
      algorithm: 'HS256',
    });
    const res = await request(app).get('/api/auth/me').set('Cookie', `splitmate_token=${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const created = await request(app).post('/api/auth/register').send(validUser);
    const expired = jwt.sign({}, env.JWT_SECRET, {
      subject: created.body.user.id,
      algorithm: 'HS256',
      expiresIn: -10,
    });
    const res = await request(app).get('/api/auth/me').set('Cookie', `splitmate_token=${expired}`);
    expect(res.status).toBe(401);
  });

  it('rejects an unsigned (alg: none) token', async () => {
    const created = await request(app).post('/api/auth/register').send(validUser);
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ sub: created.body.user.id })).toString('base64url');
    const res = await request(app).get('/api/auth/me').set('Cookie', `splitmate_token=${header}.${body}.`);
    expect(res.status).toBe(401);
  });

  it('stops working once the account is deleted', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(validUser);
    await prisma.user.update({ where: { email: 'alex@example.com' }, data: { deletedAt: new Date() } });
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the cookie so the session ends', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(validUser);
    expect((await agent.get('/api/auth/me')).status).toBe(200);

    const out = await agent.post('/api/auth/logout');
    expect(out.status).toBe(200);
    expect(cookieHeader(out)).toMatch(/splitmate_token=;/);

    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });
});

describe('request hardening', () => {
  it('rejects a non-JSON body on a POST', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .type('form')
      .send('email=alex@example.com&password=whatever');
    expect(res.status).toBe(415);
  });

  it('returns a clean 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/JSON/);
  });

  it('returns 404 JSON for an unknown route', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });

  it('sets security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});