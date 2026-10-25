import { Link } from 'react-router-dom';

export function UnauthorizedPage() { return <div className="state-card text-center"><h1>Access denied</h1><p>This area is only available to administrators.</p><Link className="btn btn-primary" to="/">Go home</Link></div>; }
export function NotFoundPage() { return <div className="state-card text-center"><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="btn btn-primary" to="/">Go home</Link></div>; }
