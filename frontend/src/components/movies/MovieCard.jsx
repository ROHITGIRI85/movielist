import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return <article className="movie-card card h-100">
    <div className="poster-wrap">{movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} /> : <div className="poster-placeholder" aria-label="Poster unavailable">IM</div>}</div>
    <div className="card-body d-flex flex-column"><div className="eyebrow">{movie.languages?.join(' · ')}</div><h2 className="h5">{movie.title}</h2><p className="small text-secondary line-clamp">{movie.synopsis}</p><div className="small mb-3">{movie.genres?.join(', ')} · {movie.runtimeMinutes} min</div><Link className="btn btn-primary mt-auto" to={`/movies/${movie.slug || movie._id}`}>View shows</Link></div>
  </article>;
}
