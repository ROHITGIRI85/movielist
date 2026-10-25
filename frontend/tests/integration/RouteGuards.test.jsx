import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../src/context/auth/AuthContext';
import { ProtectedRoute } from '../../src/routes/RouteGuards';

vi.mock('../../src/services/api/api', () => ({
  authApi: { refresh: vi.fn().mockRejectedValue(new Error('signed out')) },
}));

test('redirects signed-out visitors to login', async () => {
  render(<MemoryRouter initialEntries={['/bookings']}><AuthProvider><Routes><Route element={<ProtectedRoute />}><Route path="/bookings" element={<h1>Bookings</h1>} /></Route><Route path="/login" element={<h1>Log in</h1>} /></Routes></AuthProvider></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
});
