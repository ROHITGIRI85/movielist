import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return <div className="admin-grid">
    <aside className="admin-sidebar" aria-label="Administration">
      <h2 className="h5">Administration</h2>
      <NavLink to="/admin" end>Dashboard</NavLink><NavLink to="/admin/movies">Movies</NavLink><NavLink to="/admin/cinemas">Cinemas</NavLink><NavLink to="/admin/shows">Shows</NavLink><NavLink to="/admin/bookings">Bookings</NavLink>
    </aside>
    <section className="admin-content"><Outlet /></section>
  </div>;
}
