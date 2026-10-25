export default function LoadingState({ label = 'Loading' }) {
  return <div className="state-card" role="status"><span className="spinner-border spinner-border-sm" /> {label}…</div>;
}
