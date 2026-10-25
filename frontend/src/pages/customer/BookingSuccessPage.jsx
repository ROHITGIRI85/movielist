import { Link, useLocation, useParams } from 'react-router-dom';

export default function BookingSuccessPage() {
  const { bookingId } = useParams(); const { state } = useLocation();
  return <div className="success-card"><div className="success-icon">✓</div><div className="eyebrow">Booking confirmed</div><h1>You’re going to the movies!</h1><p>Reference: <strong>{state?.booking?.reference || bookingId}</strong></p><div className="d-flex justify-content-center gap-2"><Link className="btn btn-primary" to={`/bookings/${bookingId}`}>View ticket</Link><Link className="btn btn-outline-light" to="/movies">Browse more</Link></div></div>;
}
