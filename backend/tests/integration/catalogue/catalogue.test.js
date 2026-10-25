const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Movie = require('../../../src/models/Movie');
const Cinema = require('../../../src/models/Cinema');
const Screen = require('../../../src/models/Screen');
const Show = require('../../../src/models/Show');
const Review = require('../../../src/models/Review');
const { ROLES } = require('../../../src/constants/roles');
const { startTestDatabase, stopTestDatabase } = require('../../helpers/database');

const adminAccount = {
  name: 'Catalogue Admin',
  email: 'catalogue-admin@example.com',
  password: 'Password1',
};

const moviePayload = {
  title: 'Journey Beyond',
  synopsis: 'Explorers travel beyond the known world and discover a hidden civilization.',
  runtimeMinutes: 128,
  releaseDate: '2030-03-20T00:00:00.000Z',
  languages: ['Hindi', 'English'],
  genres: ['Adventure', 'Drama'],
  cast: [{ name: 'Test Actor', role: 'Explorer' }],
  crew: [{ name: 'Test Director', role: 'Director' }],
  certification: 'UA',
  status: 'published',
};

const cinemaPayload = {
  name: 'Central Theater',
  address: {
    line1: '10 Main Road',
    city: 'Indore',
    state: 'Madhya Pradesh',
    postalCode: '452001',
    country: 'India',
  },
  timezone: 'Asia/Kolkata',
  amenities: ['Parking'],
};

const screenPayload = {
  name: 'Screen 1',
  seats: [
    { label: 'A1', row: 'A', number: 1, category: 'standard' },
    { label: 'A2', row: 'A', number: 2, category: 'standard' },
    { label: 'B1', row: 'B', number: 1, category: 'premium' },
  ],
};

const getAdminToken = async () => {
  await request(app).post('/api/v1/auth/register').send(adminAccount);
  await User.updateOne({ email: adminAccount.email }, { role: ROLES.ADMIN });
  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: adminAccount.email, password: adminAccount.password });
  return login.body.data.accessToken;
};

const createCatalogue = async (token) => {
  const movie = await request(app)
    .post('/api/v1/admin/movies')
    .set('Authorization', `Bearer ${token}`)
    .send(moviePayload);
  const cinema = await request(app)
    .post('/api/v1/admin/cinemas')
    .set('Authorization', `Bearer ${token}`)
    .send(cinemaPayload);
  const screen = await request(app)
    .post(`/api/v1/admin/cinemas/${cinema.body.data.cinema._id}/screens`)
    .set('Authorization', `Bearer ${token}`)
    .send(screenPayload);
  return {
    movieId: movie.body.data.movie._id,
    cinemaId: cinema.body.data.cinema._id,
    screenId: screen.body.data.screen._id,
  };
};

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
afterEach(async () => {
  await Promise.all([
    Review.deleteMany({}),
    Show.deleteMany({}),
    Screen.deleteMany({}),
    Cinema.deleteMany({}),
    Movie.deleteMany({}),
    User.deleteMany({}),
  ]);
});

describe('catalogue administration and discovery', () => {
  test('blocks ordinary customers from catalogue administration', async () => {
    const registration = await request(app).post('/api/v1/auth/register').send({
      name: 'Customer',
      email: 'ordinary@example.com',
      password: 'Password1',
    });
    const response = await request(app)
      .post('/api/v1/admin/movies')
      .set('Authorization', `Bearer ${registration.body.data.accessToken}`)
      .send(moviePayload);
    expect(response.status).toBe(403);
  });

  test('creates and publicly filters a published movie', async () => {
    const token = await getAdminToken();
    const created = await request(app)
      .post('/api/v1/admin/movies')
      .set('Authorization', `Bearer ${token}`)
      .send(moviePayload);
    expect(created.status).toBe(201);
    expect(created.body.data.movie.slug).toBe('journey-beyond');

    const response = await request(app).get('/api/v1/movies?genre=Adventure&language=Hindi');
    expect(response.status).toBe(200);
    expect(response.body.data.movies).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });

  test('hides drafts and hides an archived movie', async () => {
    const token = await getAdminToken();
    const draft = await request(app)
      .post('/api/v1/admin/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...moviePayload, status: 'draft' });
    const hiddenDraft = await request(app).get('/api/v1/movies');
    expect(hiddenDraft.body.data.movies).toHaveLength(0);

    await request(app)
      .patch(`/api/v1/admin/movies/${draft.body.data.movie._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'published' });
    const visible = await request(app).get('/api/v1/movies');
    expect(visible.body.data.movies).toHaveLength(1);

    await request(app)
      .delete(`/api/v1/admin/movies/${draft.body.data.movie._id}`)
      .set('Authorization', `Bearer ${token}`);
    const archived = await request(app).get('/api/v1/movies');
    expect(archived.body.data.movies).toHaveLength(0);
  });

  test('creates a cinema, validates seats, and exposes active screens', async () => {
    const token = await getAdminToken();
    const cinema = await request(app)
      .post('/api/v1/admin/cinemas')
      .set('Authorization', `Bearer ${token}`)
      .send(cinemaPayload);
    expect(cinema.status).toBe(201);

    const invalidScreen = await request(app)
      .post(`/api/v1/admin/cinemas/${cinema.body.data.cinema._id}/screens`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...screenPayload, seats: [screenPayload.seats[0], screenPayload.seats[0]] });
    expect(invalidScreen.status).toBe(422);

    const screen = await request(app)
      .post(`/api/v1/admin/cinemas/${cinema.body.data.cinema._id}/screens`)
      .set('Authorization', `Bearer ${token}`)
      .send(screenPayload);
    expect(screen.status).toBe(201);

    const publicScreens = await request(app).get(`/api/v1/cinemas/${cinema.body.data.cinema.slug}/screens`);
    expect(publicScreens.status).toBe(200);
    expect(publicScreens.body.data.screens).toHaveLength(1);
  });

  test('schedules a show and rejects overlapping times', async () => {
    const token = await getAdminToken();
    const ids = await createCatalogue(token);
    const payload = {
      ...ids,
      startAt: '2031-04-20T12:00:00.000Z',
      endAt: '2031-04-20T14:08:00.000Z',
      language: 'Hindi',
      format: '2D',
      pricing: [
        { category: 'standard', amount: 25000, currency: 'INR' },
        { category: 'premium', amount: 40000, currency: 'INR' },
      ],
    };
    const created = await request(app)
      .post('/api/v1/admin/shows')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(created.status).toBe(201);

    const conflict = await request(app)
      .post('/api/v1/admin/shows')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...payload, startAt: '2031-04-20T13:00:00.000Z', endAt: '2031-04-20T15:00:00.000Z' });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe('SHOW_TIME_CONFLICT');

    const publicShows = await request(app).get(`/api/v1/shows?movieId=${ids.movieId}&date=2031-04-20`);
    expect(publicShows.status).toBe(200);
    expect(publicShows.body.data.shows).toHaveLength(1);
    expect(publicShows.body.data.shows[0].movie.title).toBe(moviePayload.title);
  });

  test('rejects a screen that belongs to another cinema', async () => {
    const token = await getAdminToken();
    const ids = await createCatalogue(token);
    const otherCinema = await request(app)
      .post('/api/v1/admin/cinemas')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...cinemaPayload, name: 'North Theater', address: { ...cinemaPayload.address, line1: '20 North Road' } });

    const response = await request(app)
      .post('/api/v1/admin/shows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: ids.movieId,
        cinemaId: otherCinema.body.data.cinema._id,
        screenId: ids.screenId,
        startAt: '2031-04-21T12:00:00.000Z',
        endAt: '2031-04-21T14:08:00.000Z',
        language: 'Hindi',
        format: '2D',
        pricing: [{ category: 'standard', amount: 25000, currency: 'INR' }],
      });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('SCREEN_CINEMA_MISMATCH');
  });
});

