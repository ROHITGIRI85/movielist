const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const { ROLES } = require('../../../src/constants/roles');
const { startTestDatabase, stopTestDatabase } = require('../../helpers/database');

const validCustomer = {
  name: 'Test Customer',
  email: 'customer@example.com',
  phone: '+919876543210',
  password: 'Password1',
};

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
afterEach(async () => User.deleteMany({}));

describe('health', () => {
  test('reports a ready database', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ready');
  });
});

describe('authentication API', () => {
  test('registers a customer without exposing private fields', async () => {
    const response = await request(app).post('/api/v1/auth/register').send(validCustomer);

    expect(response.status).toBe(201);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({
      name: validCustomer.name,
      email: validCustomer.email,
      phone: validCustomer.phone,
      role: ROLES.CUSTOMER,
    });
    expect(response.body.data.user).not.toHaveProperty('passwordHash');
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  test('rejects duplicate normalized email addresses', async () => {
    await request(app).post('/api/v1/auth/register').send(validCustomer);
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validCustomer, email: ' CUSTOMER@EXAMPLE.COM ' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  test('logs in and reads and updates the profile', async () => {
    await request(app).post('/api/v1/auth/register').send(validCustomer);
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validCustomer.email, password: validCustomer.password });
    const token = login.body.data.accessToken;

    const profile = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.user.email).toBe(validCustomer.email);

    const update = await request(app)
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Customer', phone: '+919999999999' });
    expect(update.status).toBe(200);
    expect(update.body.data.user.name).toBe('Updated Customer');
    expect(update.body.data.user.phone).toBe('+919999999999');
  });

  test('rotates the refresh session and makes logout idempotent', async () => {
    const agent = request.agent(app);
    const registration = await agent.post('/api/v1/auth/register').send(validCustomer);
    expect(registration.status).toBe(201);

    const refresh = await agent.post('/api/v1/auth/refresh').send();
    expect(refresh.status).toBe(200);
    expect(refresh.body.data.accessToken).toEqual(expect.any(String));

    const logout = await agent.post('/api/v1/auth/logout').send();
    expect(logout.status).toBe(204);

    const secondLogout = await agent.post('/api/v1/auth/logout').send();
    expect(secondLogout.status).toBe(204);
  });

  test('rejects invalid credentials and unauthenticated profile access', async () => {
    await request(app).post('/api/v1/auth/register').send(validCustomer);
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validCustomer.email, password: 'WrongPassword1' });
    const profile = await request(app).get('/api/v1/auth/me');

    expect(login.status).toBe(401);
    expect(login.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(profile.status).toBe(401);
  });

  test('enforces the admin role', async () => {
    await request(app).post('/api/v1/auth/register').send(validCustomer);
    const customerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validCustomer.email, password: validCustomer.password });
    const forbidden = await request(app)
      .get('/api/v1/admin/status')
      .set('Authorization', `Bearer ${customerLogin.body.data.accessToken}`);
    expect(forbidden.status).toBe(403);

    await User.updateOne({ email: validCustomer.email }, { role: ROLES.ADMIN });
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validCustomer.email, password: validCustomer.password });
    const allowed = await request(app)
      .get('/api/v1/admin/status')
      .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`);
    expect(allowed.status).toBe(200);
  });
});

