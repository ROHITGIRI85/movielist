export function ErrorState({ message, onRetry }) {
  return <div className="alert alert-danger" role="alert">{message}{onRetry && <button className="btn btn-sm btn-outline-danger ms-3" onClick={onRetry}>Try again</button>}</div>;
}

export function EmptyState({ title, text }) {
  return <div className="state-card text-center"><h2 className="h5">{title}</h2><p className="mb-0 text-secondary">{text}</p></div>;
}
