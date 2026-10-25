import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/Feedback';
import { bookingApi } from '../../services/api/api';
import { errorMessage } from '../../services/http/httpClient';
import { dateTime, money } from '../../utils/format';

export default function BookingDetailsPage() {
  const { bookingId } = useParams(); const [booking, setBooking] = useState(null); const [error, setError] = useState('');
  const load = () => bookingApi.get(bookingId).then(({ data }) => setBooking(data.data.booking)).catch((err) => setError(errorMessage(err)));
  useEffect(() => { load(); }, [bookingId]);
  const cancel = async () => { if (!window.confirm('Cancel this booking and release its seats?')) return; try { const { data } = await bookingApi.cancel(bookingId); setBooking(data.data.booking); } catch (err) { setError(errorMessage(err)); } };
  if (!booking && !error) return <LoadingState label="Loading ticket" />; if (error && !booking) return <ErrorState message={error} />;
  return <div className="ticket"><div className="ticket-head"><div><div className="eyebrow">{booking.reference}</div><h1>{booking.show?.movie?.title}</h1></div><span className={`status status-${booking.status}`}>{booking.status}</span></div>{error && <ErrorState message={error} />}<div className="ticket-grid"><div><span>Cinema</span><strong>{booking.show?.cinema?.name}</strong></div><div><span>Show</span><strong>{dateTime(booking.show?.startAt)}</strong></div><div><span>Seats</span><strong>{booking.seats.map((seat) => seat.label).join(', ')}</strong></div><div><span>Total</span><strong>{money(booking.total, booking.currency)}</strong></div></div>{['held', 'confirmed'].includes(booking.status) && <button className="btn btn-outline-danger mt-4" onClick={cancel}>Cancel booking</button>}</div>;
}
