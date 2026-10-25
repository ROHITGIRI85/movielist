import { render, screen } from '@testing-library/react';
import App from '../../src/app/App';

const booking = {
  _id: 'booking-1', reference: 'IMV-TEST-1', status: 'confirmed', total: 25000, currency: 'INR',
  seats: [{ label: 'A1' }],
  show: { startAt: '2035-05-20T12:00:00.000Z', movie: { title: 'Test Movie' }, cinema: { name: 'Test Cinema' } },
};

vi.mock('../../src/context/auth/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Customer', role: 'customer' }, ready: true, logout: vi.fn() }),
}));

vi.mock('../../src/services/api/api', () => ({
  adminApi: {}, authApi: {},
  bookingApi: {
    list: vi.fn(() => Promise.resolve({ data: { data: { bookings: [booking] } } })),
    get: vi.fn(() => Promise.resolve({ data: { data: { booking } } })),
  },
  catalogueApi: {
    seats: vi.fn(() => Promise.resolve({ data: { data: { seats: [
      { _id: 'inventory-1', seatId: 'seat-1', label: 'A1', category: 'standard', status: 'available', amount: 25000, currency: 'INR' },
    ] } } })),
  },
}));

test.each([
  ['/bookings', 'My bookings'],
  ['/bookings/booking-1', 'Test Movie'],
  ['/shows/show-1/seats', 'Choose your seats'],
])('renders and cleanly unmounts the protected customer page at %s', async (path, heading) => {
  window.history.pushState({}, '', path);
  const view = render(<App />);
  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  expect(() => view.unmount()).not.toThrow();
});