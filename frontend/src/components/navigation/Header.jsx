import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  return <header className="site-header">
    <nav className="navbar navbar-expand-lg container" aria-label="Main navigation">
      <Link className="navbar-brand brand" to="/">IMovies</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>
      <div className="collapse navbar-collapse" id="mainNav">
        <div className="navbar-nav me-auto">
          <NavLink className="nav-link" to="/movies">Movies</NavLink>
          {user && <NavLink className="nav-link" to="/bookings">My bookings</NavLink>}
          {user?.role === 'admin' && <NavLink className="nav-link" to="/admin">Admin</NavLink>}
        </div>
        <div className="d-flex gap-2 align-items-center">
          {user ? <><NavLink className="btn btn-sm btn-outline-light" to="/profile">{user.name}</NavLink><button className="btn btn-sm btn-danger" onClick={logout}>Log out</button></> : <><NavLink className="btn btn-sm btn-outline-light" to="/login">Log in</NavLink><NavLink className="btn btn-sm btn-primary" to="/register">Join</NavLink></>}
        </div>
      </div>
    </nav>
  </header>;
}
