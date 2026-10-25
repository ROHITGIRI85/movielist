import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/Feedback';
import { bookingApi } from '../../services/api/api';
import { errorMessage } from '../../services/http/httpClient';
import { money } from '../../utils/format';

export default function CheckoutPage() {
  const { bookingId } = useParams(); const navigate = useNavigate(); const [booking, setBooking] = useState(null); const [remaining, setRemaining] = useState(0); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { bookingApi.get(bookingId).then(({ data }) => setBooking(data.data.booking)).catch((err) => setError(errorMessage(err))); }, [bookingId]);
  useEffect(() => { if (!booking) return undefined; const tick = () => setRemaining(Math.max(0, Math.ceil((new Date(booking.holdExpiresAt) - Date.now()) / 1000))); tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer); }, [booking]);
  const confirm = async (paymentResult) => { setBusy(true); setError(''); try { const { data } = await bookingApi.confirm(bookingId, { paymentResult }); sessionStorage.removeItem(`booking:${bookingId}`); navigate(`/booking-success/${data.data.booking._id}`, { state: { booking: data.data.booking } }); } catch (err) { setError(errorMessage(err)); if (err.response?.data?.error?.code === 'HOLD_EXPIRED') setRemaining(0); } finally { setBusy(false); } };
  if (!booking && !error) return <LoadingState label="Loading checkout" />;
  return <div className="checkout-card"><div className="eyebrow">Simulated checkout</div><h1>Review and confirm</h1>{error && <ErrorState message={error} />} {booking && <><div className={`hold-timer ${remaining <= 30 ? 'urgent' : ''}`} role="timer">Hold expires in {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</div><dl className="summary-list"><div><dt>Seats</dt><dd>{booking.seats.map((seat) => seat.label).join(', ')}</dd></div><div><dt>Subtotal</dt><dd>{money(booking.subtotal, booking.currency)}</dd></div><div><dt>Fees</dt><dd>{money(booking.fees, booking.currency)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{money(booking.total, booking.currency)}</dd></div></dl><p className="small text-secondary">This phase uses a payment simulator. No card data is requested or stored.</p><div className="d-flex gap-2"><button className="btn btn-primary flex-grow-1" disabled={busy || remaining <= 0} onClick={() => confirm('success')}>Simulate successful payment</button><button className="btn btn-outline-danger" disabled={busy || remaining <= 0} onClick={() => confirm('failure')}>Simulate failure</button></div></>}</div>;
}
