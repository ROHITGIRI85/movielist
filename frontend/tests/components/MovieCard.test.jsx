import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieCard from '../../src/components/movies/MovieCard';

test('renders accessible movie information and details link', () => {
  render(<MemoryRouter><MovieCard movie={{ _id: '1', slug: 'test-movie', title: 'Test Movie', synopsis: 'A test story.', languages: ['Hindi'], genres: ['Drama'], runtimeMinutes: 120 }} /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Test Movie' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View shows' })).toHaveAttribute('href', '/movies/test-movie');
  expect(screen.getByLabelText('Poster unavailable')).toBeInTheDocument();
});
