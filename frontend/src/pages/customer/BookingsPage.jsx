import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState';
import { EmptyState, ErrorState } from '../../components/common/Feedback';
import { bookingApi } from '../../services/api/api';
import { errorMessage } from '../../services/http/httpClient';
import { dateTime, money } from '../../utils/format';

export default function BookingsPage() {
  const [bookings, setBookings] = useState(null); const [error, setError] = useState('');
  const load = () => bookingApi.list().then(({ data }) => setBookings(data.data.bookings)).catch((err) => setError(errorMessage(err)));
  useEffect(() => { load(); }, []);
  if (!bookings && !error) return <LoadingState label="Loading bookings" />;
  return <><div className="page-heading"><div><div className="eyebrow">Your tickets</div><h1>My bookings</h1></div></div>{error ? <ErrorState message={error} onRetry={load} /> : !bookings.length ? <EmptyState title="No bookings yet" text="Your held and confirmed tickets will appear here." /> : <div className="booking-list">{bookings.map((booking) => <Link className="booking-card" to={`/bookings/${booking._id}`} key={booking._id}><div><span className={`status status-${booking.status}`}>{booking.status}</span><h2 className="h5 mt-2">{booking.show?.movie?.title || 'Movie booking'}</h2><div>{booking.show?.startAt && dateTime(booking.show.startAt)} · {booking.seats.map((seat) => seat.label).join(', ')}</div></div><div><strong>{money(booking.total, booking.currency)}</strong><small>{booking.reference}</small></div></Link>)}</div>}</>;
}
