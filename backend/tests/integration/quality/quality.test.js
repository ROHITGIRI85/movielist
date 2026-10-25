const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const { startTestDatabase, stopTestDatabase } = require('../../helpers/database');

const customer = { name: 'Security Customer', password: 'Password1' };

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
afterEach(async () => User.deleteMany({}));

describe('HTTP security baseline', () => {
  test('sets security headers and does not disclose Express', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers).not.toHaveProperty('x-powered-by');
  });

  test('only advertises CORS access to the configured frontend origin', async () => {
    const allowed = await request(app).get('/api/v1/health').set('Origin', 'http://localhost:5173');
    const disallowed = await request(app).get('/api/v1/health').set('Origin', 'https://attacker.example');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');
    expect(disallowed.headers).not.toHaveProperty('access-control-allow-origin');
  });

  test.each([
    ['GET', '/api/v1/auth/me'], ['GET', '/api/v1/bookings'], ['GET', '/api/v1/admin/status'],
    ['GET', '/api/v1/admin/movies'], ['GET', '/api/v1/admin/cinemas'], ['GET', '/api/v1/admin/shows'],
    ['GET', '/api/v1/admin/bookings'],
  ])('rejects unauthenticated %s %s', async (method, path) => {
    const response = await request(app)[method.toLowerCase()](path);
    expect(response.status).toBe(401);
    expect(response.body.error).not.toHaveProperty('stack');
  });

  test.each([
    '/api/v1/admin/status', '/api/v1/admin/movies', '/api/v1/admin/cinemas',
    '/api/v1/admin/shows', '/api/v1/admin/bookings',
  ])('rejects a customer at admin endpoint %s', async (path) => {
    const registration = await request(app).post('/api/v1/auth/register').send({
      ...customer, email: path.replace(/[^a-z]/g, '') + '@example.com',
    });
    const response = await request(app)
      .get(path)
      .set('Authorization', 'Bearer ' + registration.body.data.accessToken);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});