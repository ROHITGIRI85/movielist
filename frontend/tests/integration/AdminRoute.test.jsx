import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from '../../src/routes/RouteGuards';

vi.mock('../../src/context/auth/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'customer' }, ready: true }),
}));

test('redirects ordinary customers away from administration', async () => {
  render(<MemoryRouter initialEntries={['/admin']}><Routes><Route element={<AdminRoute />}><Route path="/admin" element={<h1>Admin</h1>} /></Route><Route path="/unauthorized" element={<h1>Access denied</h1>} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
});
