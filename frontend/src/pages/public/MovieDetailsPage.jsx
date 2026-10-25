import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState';
import { EmptyState, ErrorState } from '../../components/common/Feedback';
import { catalogueApi } from '../../services/api/api';
import { errorMessage } from '../../services/http/httpClient';
import { dateTime, money } from '../../utils/format';

export default function MovieDetailsPage() {
  const { movieId } = useParams(); const [movie, setMovie] = useState(null); const [shows, setShows] = useState([]); const [error, setError] = useState('');
  useEffect(() => { catalogueApi.movie(movieId).then(async (movieResponse) => { const item = movieResponse.data.data.movie; setMovie(item); const showResponse = await catalogueApi.shows({ movieId: item._id }); setShows(showResponse.data.data.shows); }).catch((err) => setError(errorMessage(err))); }, [movieId]);
  if (error) return <ErrorState message={error} />; if (!movie) return <LoadingState label="Loading movie" />;
  return <><section className="movie-hero">{movie.posterUrl && <img src={movie.posterUrl} alt={`${movie.title} poster`} />}<div><div className="eyebrow">{movie.genres.join(' · ')}</div><h1>{movie.title}</h1><p>{movie.synopsis}</p><p>{movie.languages.join(', ')} · {movie.runtimeMinutes} min · {movie.certification || 'Unrated'}</p></div></section><section className="mt-5"><h2>Available shows</h2>{!shows.length ? <EmptyState title="No shows scheduled" text="Please check again later." /> : <div className="show-list">{shows.map((show) => <article className="show-card" key={show._id}><div><strong>{show.cinema.name}</strong><div>{dateTime(show.startAt)} · {show.language} · {show.format}</div></div><div><span className="me-3">From {money(Math.min(...show.pricing.map((p) => p.amount)), show.pricing[0].currency)}</span><Link className="btn btn-primary" to={`/shows/${show._id}/seats`}>Choose seats</Link></div></article>)}</div>}</section></>;
}
