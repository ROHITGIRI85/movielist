import { fireEvent, render, screen } from '@testing-library/react';
import SeatMap from '../../src/components/seats/SeatMap';

test('describes status in text and only selects available seats', () => {
  const toggle = vi.fn();
  render(<SeatMap seats={[{ _id: '1', seatId: 's1', label: 'A1', category: 'standard', status: 'available' }, { _id: '2', seatId: 's2', label: 'A2', category: 'standard', status: 'booked' }]} selected={[]} onToggle={toggle} />);
  fireEvent.click(screen.getByRole('button', { name: 'A1, standard, available' }));
  expect(toggle).toHaveBeenCalledWith('s1');
  expect(screen.getByRole('button', { name: 'A2, standard, booked' })).toBeDisabled();
  expect(screen.getByText('booked')).toBeInTheDocument();
});
