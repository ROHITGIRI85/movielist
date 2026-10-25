const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Movie = require('../../../src/models/Movie');
const Cinema = require('../../../src/models/Cinema');
const Screen = require('../../../src/models/Screen');
const Show = require('../../../src/models/Show');
const ShowSeat = require('../../../src/models/ShowSeat');
const Booking = require('../../../src/models/Booking');
const { ROLES } = require('../../../src/constants/roles');
const { startTestDatabase, stopTestDatabase } = require('../../helpers/database');

const register = async (name, email) => {
  const response = await request(app).post('/api/v1/auth/register').send({ name, email, password: 'Password1' });
  return { token: response.body.data.accessToken, id: response.body.data.user.id };
};

const createBookableShow = async () => {
  await register('Booking Admin', 'booking-admin@example.com');
  await User.updateOne({ email: 'booking-admin@example.com' }, { role: ROLES.ADMIN });
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'booking-admin@example.com', password: 'Password1' });
  const token = login.body.data.accessToken;
  const movie = await request(app).post('/api/v1/admin/movies').set('Authorization', `Bearer ${token}`).send({
    title: 'Booking Test Movie', synopsis: 'A sufficiently descriptive booking test movie synopsis.', runtimeMinutes: 120,
    releaseDate: '2034-01-01T00:00:00.000Z', languages: ['English'], genres: ['Drama'], status: 'published',
  });
  const cinema = await request(app).post('/api/v1/admin/cinemas').set('Authorization', `Bearer ${token}`).send({
    name: 'Booking Test Cinema', address: { line1: '1 Test Street', city: 'Indore', state: 'Madhya Pradesh', postalCode: '452001', country: 'India' }, timezone: 'Asia/Kolkata',
  });
  const screen = await request(app).post(`/api/v1/admin/cinemas/${cinema.body.data.cinema._id}/screens`).set('Authorization', `Bearer ${token}`).send({
    name: 'Screen 1', seats: [
      { label: 'A1', row: 'A', number: 1, category: 'standard' },
      { label: 'A2', row: 'A', number: 2, category: 'standard' },
    ],
  });
  const show = await request(app).post('/api/v1/admin/shows').set('Authorization', `Bearer ${token}`).send({
    movieId: movie.body.data.movie._id, cinemaId: cinema.body.data.cinema._id, screenId: screen.body.data.screen._id,
    startAt: '2035-05-20T12:00:00.000Z', endAt: '2035-05-20T14:00:00.000Z', language: 'English', format: '2D',
    pricing: [{ category: 'standard', amount: 25000, currency: 'INR' }],
  });
  return { showId: show.body.data.show._id, adminToken: token };
};

beforeAll(startTestDatabase);
afterAll(stopTestDatabase);
afterEach(async () => {
  await Promise.all([Booking.deleteMany({}), ShowSeat.deleteMany({}), Show.deleteMany({}), Screen.deleteMany({}), Cinema.deleteMany({}), Movie.deleteMany({}), User.deleteMany({})]);
});

describe('seat inventory and bookings', () => {
  test('creates show inventory and never exposes hold secrets', async () => {
    const { showId } = await createBookableShow();
    const seats = await request(app).get(`/api/v1/shows/${showId}/seats`);
    expect(seats.status).toBe(200);
    expect(seats.body.data.seats).toHaveLength(2);
    expect(seats.body.data.seats[0]).not.toHaveProperty('holdToken');
    const stored = await ShowSeat.findOne({ show: showId });
    const duplicate = stored.toObject();
    delete duplicate._id;
    await expect(ShowSeat.create(duplicate)).rejects.toMatchObject({ code: 11000 });
  });

  test('uses server seat prices and confirms a successful simulated payment', async () => {
    const { showId } = await createBookableShow();
    const customer = await register('First Customer', 'first@example.com');
    const seat = await ShowSeat.findOne({ show: showId });
    const held = await request(app).post('/api/v1/bookings/holds').set('Authorization', `Bearer ${customer.token}`).send({
      showId, seatIds: [seat.seatId.toString()], total: 1,
    });
    expect(held.status).toBe(201);
    expect(held.body.data.booking.total).toBe(25000);
    expect(held.body.data.booking).not.toHaveProperty('holdToken');

    const confirmed = await request(app).post(`/api/v1/bookings/${held.body.data.booking._id}/confirm`).set('Authorization', `Bearer ${customer.token}`).send({ paymentResult: 'success' });
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.data.booking.status).toBe('confirmed');
    expect((await ShowSeat.findById(seat._id)).status).toBe('booked');
  });

  test.each([1, 2, 3])('allows only one winner when two customers request the same seat concurrently (round %i)', async (round) => {
    const { showId } = await createBookableShow();
    const [first, second] = await Promise.all([register('First Customer', 'first-' + round + '@example.com'), register('Second Customer', 'second-' + round + '@example.com')]);
    const seat = await ShowSeat.findOne({ show: showId });
    const payload = { showId, seatIds: [seat.seatId.toString()] };
    const responses = await Promise.all([
      request(app).post('/api/v1/bookings/holds').set('Authorization', `Bearer ${first.token}`).send(payload),
      request(app).post('/api/v1/bookings/holds').set('Authorization', `Bearer ${second.token}`).send(payload),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(responses.find((response) => response.status === 409).body.error.code).toBe('SEATS_UNAVAILABLE');
    expect(await Booking.countDocuments({ status: 'held' })).toBe(1);
    const winner = responses.find((response) => response.status === 201);
    const winnerToken = winner === responses[0] ? first.token : second.token;
    const confirmed = await request(app).post(`/api/v1/bookings/${winner.body.data.booking._id}/confirm`).set('Authorization', `Bearer ${winnerToken}`).send({ paymentResult: 'success' });
    expect(confirmed.body.data.booking.status).toBe('confirmed');
    expect(await Booking.countDocuments({ status: 'confirmed' })).toBe(1);
  });

  test('rejects an expired hold and releases its seat', async () => {
    const { showId } = await createBookableShow();
    const customer = await register('First Customer', 'first@example.com');
    const seat = await ShowSeat.findOne({ show: showId });
    const held = await request(app).post('/api/v1/bookings/holds').set('Authorization', `Bearer ${customer.token}`).send({ showId, seatIds: [seat.seatId] });
    const past = new Date(Date.now() - 1000);
    await Booking.updateOne({ _id: held.body.data.booking._id }, { holdExpiresAt: past });
    await ShowSeat.updateOne({ _id: seat._id }, { holdExpiresAt: past });
    const response = await request(app).post(`/api/v1/bookings/${held.body.data.booking._id}/confirm`).set('Authorization', `Bearer ${customer.token}`).send({ paymentResult: 'success' });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('HOLD_EXPIRED');
    expect((await ShowSeat.findById(seat._id)).status).toBe('available');
  });

  test('hides another customer booking and releases seats on cancellation', async () => {
    const { showId } = await createBookableShow();
    const [owner, stranger] = await Promise.all([register('Booking Owner', 'owner@example.com'), register('Other Customer', 'other@example.com')]);
    const seat = await ShowSeat.findOne({ show: showId });
    const held = await request(app).post('/api/v1/bookings/holds').set('Authorization', `Bearer ${owner.token}`).send({ showId, seatIds: [seat.seatId] });
    const hidden = await request(app).get(`/api/v1/bookings/${held.body.data.booking._id}`).set('Authorization', `Bearer ${stranger.token}`);
    expect(hidden.status).toBe(404);
    const cancelled = await request(app).post(`/api/v1/bookings/${held.body.data.booking._id}/cancel`).set('Authorization', `Bearer ${owner.token}`);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.booking.status).toBe('cancelled');
    expect((await ShowSeat.findById(seat._id)).status).toBe('available');
  });

  test('releases seats when the simulated payment fails', async () => {
    const { showId } = await createBookableShow();
    const customer = await register('First Customer', 'first@example.com');
    const seat = await ShowSeat.findOne({ show: showId });
    const held = await request(app).post('/api/v1/bookings/holds').set('Authorization', `Bearer ${customer.token}`).send({ showId, seatIds: [seat.seatId] });
    const failed = await request(app).post(`/api/v1/bookings/${held.body.data.booking._id}/confirm`).set('Authorization', `Bearer ${customer.token}`).send({ paymentResult: 'failure' });
    expect(failed.status).toBe(402);
    expect((await ShowSeat.findById(seat._id)).status).toBe('available');
  });
});
