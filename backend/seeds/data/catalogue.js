const mongoose = require('mongoose');

const objectId = (suffix) => new mongoose.Types.ObjectId(`7000000000000000000000${suffix}`);

const ids = Object.freeze({
  movies: [objectId('01'), objectId('05'), objectId('06'), objectId('07'), objectId('08'), objectId('09')],
  cinema: objectId('02'),
  screen: objectId('03'),
  shows: [objectId('04'), objectId('10'), objectId('11'), objectId('12'), objectId('13'), objectId('14')],
});

const movie = (index, details) => ({
  _id: ids.movies[index],
  certification: 'UA',
  status: 'published',
  averageRating: 0,
  reviewCount: 0,
  ...details,
});

const movies = [
  movie(0, { title: 'The Last Horizon', slug: 'the-last-horizon', synopsis: 'A crew crosses an unknown frontier to find a new home for humanity.', runtimeMinutes: 142, releaseDate: new Date('2029-12-15T00:00:00.000Z'), languages: ['English', 'Hindi'], genres: ['Science Fiction', 'Adventure'], cast: [{ name: 'Aarav Mehta', role: 'Commander Arin' }], crew: [{ name: 'Maya Rao', role: 'Director' }] }),
  movie(1, { title: 'Midnight Protocol', slug: 'midnight-protocol', synopsis: 'An intelligence officer has one night to stop a conspiracy hidden inside her own agency.', runtimeMinutes: 128, releaseDate: new Date('2029-11-22T00:00:00.000Z'), languages: ['Hindi', 'English'], genres: ['Action', 'Thriller'], cast: [{ name: 'Kabir Singh', role: 'Agent Veer' }], crew: [{ name: 'Nisha Kapoor', role: 'Director' }] }),
  movie(2, { title: 'Monsoon Letters', slug: 'monsoon-letters', synopsis: 'Two childhood friends reconnect through letters delivered during a life-changing monsoon.', runtimeMinutes: 116, releaseDate: new Date('2029-10-03T00:00:00.000Z'), languages: ['Hindi'], genres: ['Romance', 'Drama'], cast: [{ name: 'Ishita Verma', role: 'Meera' }], crew: [{ name: 'Rohan Desai', role: 'Director' }], certification: 'U' }),
  movie(3, { title: 'Orbit Nine', slug: 'orbit-nine', synopsis: 'A rescue pilot discovers that an abandoned orbital station is still sending messages home.', runtimeMinutes: 135, releaseDate: new Date('2029-12-28T00:00:00.000Z'), languages: ['English', 'Hindi', 'Tamil'], genres: ['Science Fiction', 'Mystery'], cast: [{ name: 'Tara Menon', role: 'Captain Leena' }], crew: [{ name: 'Dev Malhotra', role: 'Director' }] }),
  movie(4, { title: 'Laugh Track', slug: 'laugh-track', synopsis: 'A struggling comic accidentally becomes the star of a reality show he never agreed to join.', runtimeMinutes: 104, releaseDate: new Date('2029-09-12T00:00:00.000Z'), languages: ['Hindi', 'Marathi'], genres: ['Comedy'], cast: [{ name: 'Arjun Joshi', role: 'Ravi' }], crew: [{ name: 'Sneha Kulkarni', role: 'Director' }], certification: 'U' }),
  movie(5, { title: 'The Hidden Temple', slug: 'the-hidden-temple', synopsis: 'Young archaeologists race across ancient ruins to protect a map that should never be found.', runtimeMinutes: 124, releaseDate: new Date('2029-08-18T00:00:00.000Z'), languages: ['Hindi', 'Tamil', 'Telugu'], genres: ['Adventure', 'Mystery'], cast: [{ name: 'Anaya Rao', role: 'Dr. Kavya' }], crew: [{ name: 'Vikram Iyer', role: 'Director' }] }),
];

const cinema = {
  _id: ids.cinema,
  name: 'IMovies Central Theater',
  slug: 'imovies-central-theater',
  address: { line1: '100 Cinema Road', city: 'Indore', state: 'Madhya Pradesh', postalCode: '452001', country: 'India' },
  timezone: 'Asia/Kolkata',
  amenities: ['Parking', 'Food Court', 'Wheelchair Access'],
  isActive: true,
};

const seats = ['A', 'B', 'C'].flatMap((row, rowIndex) => Array.from({ length: 8 }, (_, index) => ({
  label: `${row}${index + 1}`, row, number: index + 1, category: rowIndex === 2 ? 'premium' : 'standard', isAccessible: row === 'A' && index < 2, isActive: true,
})));

const screen = { _id: ids.screen, cinema: ids.cinema, name: 'Screen 1', seats, isActive: true };

const show = (index, movieIndex, startAt, endAt, language, format = '2D') => ({
  _id: ids.shows[index], movie: ids.movies[movieIndex], cinema: ids.cinema, screen: ids.screen,
  startAt: new Date(startAt), endAt: new Date(endAt), language, format,
  pricing: [{ category: 'standard', amount: 25000 + index * 1000, currency: 'INR' }, { category: 'premium', amount: 40000 + index * 1000, currency: 'INR' }],
  bookingOpensAt: new Date('2026-01-01T00:00:00.000Z'), bookingClosesAt: new Date(new Date(startAt).getTime() - 15 * 60 * 1000), status: 'scheduled',
});

const shows = [
  show(0, 0, '2030-01-05T06:30:00.000Z', '2030-01-05T08:52:00.000Z', 'Hindi'),
  show(1, 1, '2030-01-05T10:00:00.000Z', '2030-01-05T12:08:00.000Z', 'English', 'IMAX'),
  show(2, 2, '2030-01-05T13:00:00.000Z', '2030-01-05T14:56:00.000Z', 'Hindi'),
  show(3, 3, '2030-01-06T06:30:00.000Z', '2030-01-06T08:45:00.000Z', 'English', '3D'),
  show(4, 4, '2030-01-06T10:00:00.000Z', '2030-01-06T11:44:00.000Z', 'Hindi'),
  show(5, 5, '2030-01-06T13:00:00.000Z', '2030-01-06T15:04:00.000Z', 'Hindi'),
];

// Singular aliases keep older tests and examples compatible.
module.exports = { ids: { ...ids, movie: ids.movies[0], show: ids.shows[0] }, movies, cinema, screen, shows, movie: movies[0], show: shows[0] };