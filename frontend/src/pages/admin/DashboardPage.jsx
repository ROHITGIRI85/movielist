import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api/api';
import { errorMessage } from '../../services/http/httpClient';
import LoadingState from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/Feedback';

export default function DashboardPage() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const responses = await Promise.all([
        adminApi.movies({ limit: 1 }),
        adminApi.cinemas({ limit: 1 }),
        adminApi.shows({ limit: 1 }),
        adminApi.bookings({ limit: 1 }),
      ]);
      setCounts(responses.map(({ data }) => data.meta?.total || 0));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!counts) return <LoadingState label="Loading dashboard" />;

  const cards = [
    ['Movies', counts[0], '/admin/movies'],
    ['Cinemas', counts[1], '/admin/cinemas'],
    ['Shows', counts[2], '/admin/shows'],
    ['Bookings', counts[3], '/admin/bookings'],
  ];

  return <><div className="page-heading"><div><div className="eyebrow">Operations</div><h1>Admin dashboard</h1></div></div><div className="stat-grid">{cards.map(([label, value, to]) => <Link to={to} className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><small>Manage →</small></Link>)}</div></>;
}