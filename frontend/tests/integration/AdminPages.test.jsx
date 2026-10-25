import { render, screen } from '@testing-library/react';
import App from '../../src/app/App';

const ok = (data, total = 0) => Promise.resolve({ data: { data, meta: { total } } });

vi.mock('../../src/context/auth/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Admin', role: 'admin' }, ready: true, logout: vi.fn() }),
}));

vi.mock('../../src/services/api/api', () => ({
  adminApi: {
    movies: vi.fn(() => ok({ movies: [] }, 6)),
    cinemas: vi.fn(() => ok({ cinemas: [] }, 1)),
    screens: vi.fn(() => ok({ screens: [] })),
    shows: vi.fn(() => ok({ shows: [] }, 6)),
    bookings: vi.fn(() => ok({ bookings: [] }, 0)),
  },
  authApi: {},
  bookingApi: {},
  catalogueApi: {},
}));

test.each([
  ['/admin', 'Admin dashboard'],
  ['/admin/movies', 'Movies'],
  ['/admin/cinemas', 'Cinemas and screens'],
  ['/admin/shows', 'Shows'],
  ['/admin/bookings', 'Bookings'],
])('renders the protected admin page at %s', async (path, heading) => {
  window.history.pushState({}, '', path);
  render(<App />);
  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
});