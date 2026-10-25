import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeatMap from '../../components/seats/SeatMap';
import LoadingState from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/Feedback';
import { bookingApi, catalogueApi } from '../../services/api/api';
import { errorMessage } from '../../services/http/httpClient';
import { money } from '../../utils/format';

export default function SeatSelectionPage() {
  const { showId } = useParams(); const navigate = useNavigate();
  const [seats, setSeats] = useState([]); const [selected, setSelected] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const load = () => { setLoading(true); catalogueApi.seats(showId).then(({ data }) => setSeats(data.data.seats)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [showId]);
  const total = useMemo(() => seats.filter((seat) => selected.includes(seat.seatId)).reduce((sum, seat) => sum + seat.amount, 0), [seats, selected]);
  const toggle = (id) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 10 ? [...items, id] : items);
  const hold = async () => { setBusy(true); setError(''); try { const { data } = await bookingApi.hold({ showId, seatIds: selected }); sessionStorage.setItem(`booking:${data.data.booking._id}`, JSON.stringify(data.data.booking)); navigate(`/checkout/${data.data.booking._id}`); } catch (err) { setError(errorMessage(err)); if (err.response?.status === 409) { setSelected([]); load(); } } finally { setBusy(false); } };
  if (loading) return <LoadingState label="Loading seats" />;
  return <><div className="page-heading"><div><div className="eyebrow">Seat selection</div><h1>Choose your seats</h1></div><div className="price-total"><span>{selected.length} selected</span><strong>{money(total, seats[0]?.currency)}</strong></div></div>{error && <ErrorState message={error} />}<SeatMap seats={seats} selected={selected} onToggle={toggle} /><div className="sticky-action"><span>Your seats: {seats.filter((seat) => selected.includes(seat.seatId)).map((seat) => seat.label).join(', ') || 'None'}</span><button className="btn btn-primary" disabled={!selected.length || busy} onClick={hold}>{busy ? 'Holding…' : 'Hold seats and continue'}</button></div></>;
}
