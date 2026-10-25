const {
  validateMovieCreate,
  validateScreenCreate,
  validateShowCreate,
} = require('../../../src/validators/catalogue/catalogueValidators');

describe('catalogue validators', () => {
  test('normalizes valid movie data', () => {
    const result = validateMovieCreate({
      title: '  Test Movie ',
      synopsis: 'A sufficiently detailed test movie synopsis.',
      runtimeMinutes: 120,
      releaseDate: '2030-01-01',
      languages: ['Hindi', 'Hindi', 'English'],
      genres: ['Drama'],
      status: 'published',
    });

    expect(result.errors).toEqual([]);
    expect(result.value.title).toBe('Test Movie');
    expect(result.value.languages).toEqual(['Hindi', 'English']);
  });

  test('rejects duplicate screen seats', () => {
    const result = validateScreenCreate({
      name: 'Screen 1',
      seats: [
        { label: 'A1', row: 'A', number: 1, category: 'standard' },
        { label: 'A1', row: 'A', number: 2, category: 'standard' },
      ],
    });

    expect(result.errors).toContainEqual({ field: 'seats', message: 'Seat labels and row/number positions must be unique.' });
  });

  test('rejects a show whose end is before its start', () => {
    const id = '700000000000000000000001';
    const result = validateShowCreate({
      movieId: id,
      cinemaId: id,
      screenId: id,
      startAt: '2030-01-01T15:00:00.000Z',
      endAt: '2030-01-01T14:00:00.000Z',
      language: 'Hindi',
      format: '2D',
      pricing: [{ category: 'standard', amount: 20000, currency: 'INR' }],
    });

    expect(result.errors).toContainEqual({ field: 'endAt', message: 'Show end time must be later than start time.' });
  });
});

