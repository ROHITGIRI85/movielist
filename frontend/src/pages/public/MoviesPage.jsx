import { useEffect, useState } from 'react';
import MovieCard from '../../components/movies/MovieCard';
import LoadingState from '../../components/common/LoadingState';
import { EmptyState, ErrorState } from '../../components/common/Feedback';
import { catalogueApi } from '../../services/api/api';
import { errorMessage } from '../../services/http/httpClient';

export default function MoviesPage() {
  const [query, setQuery] = useState({ search: '', genre: '', language: '', page: 1 });
  const [result, setResult] = useState({ movies: [], meta: null });
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = () => { setLoading(true); setError(''); catalogueApi.movies({ q: query.search || undefined, genre: query.genre || undefined, language: query.language || undefined, page: query.page }).then(({ data }) => setResult({ movies: data.data.movies, meta: data.meta })).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [query.page]);
  const submit = (event) => { event.preventDefault(); setQuery((old) => ({ ...old, page: 1 })); load(); };
  return <><div className="page-heading"><div><div className="eyebrow">Now showing</div><h1>Find your movie</h1></div></div><form className="filter-bar" onSubmit={submit}><input className="form-control" aria-label="Search movies" placeholder="Search title or story" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value })} /><input className="form-control" aria-label="Genre" placeholder="Genre" value={query.genre} onChange={(e) => setQuery({ ...query, genre: e.target.value })} /><input className="form-control" aria-label="Language" placeholder="Language" value={query.language} onChange={(e) => setQuery({ ...query, language: e.target.value })} /><button className="btn btn-primary">Search</button></form>
    {loading ? <LoadingState label="Loading movies" /> : error ? <ErrorState message={error} onRetry={load} /> : !result.movies.length ? <EmptyState title="No movies found" text="Try a different search or filter." /> : <div className="movie-grid">{result.movies.map((movie) => <MovieCard key={movie._id} movie={movie} />)}</div>}
    {result.meta?.pages > 1 && <nav className="pagination-row" aria-label="Movie pages"><button className="btn btn-outline-light" disabled={query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Previous</button><span>Page {result.meta.page} of {result.meta.pages}</span><button className="btn btn-outline-light" disabled={query.page >= result.meta.pages} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Next</button></nav>}</>;
}
