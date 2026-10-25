import { Outlet } from 'react-router-dom';
import Header from '../../components/navigation/Header';

export default function CustomerLayout() {
  return <div className="app-shell"><Header /><main className="container py-4 flex-grow-1"><Outlet /></main><footer className="site-footer"><div className="container">IMovies · Movie ticket booking made simple.</div></footer></div>;
}
