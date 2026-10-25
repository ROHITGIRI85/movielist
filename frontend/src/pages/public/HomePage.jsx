import { Link } from 'react-router-dom';

export default function HomePage() {
  return <><section className="hero"><div><div className="eyebrow">Your next story starts here</div><h1>Movies, seats, done.</h1><p>Discover what is playing, choose your exact seats, and keep every ticket in one simple place.</p><Link className="btn btn-primary btn-lg" to="/movies">Explore movies</Link></div><div className="hero-orb" aria-hidden="true">IM</div></section><section className="feature-row"><article><strong>Live seats</strong><span>See availability before you book.</span></article><article><strong>Fast checkout</strong><span>Clear totals and secure server rules.</span></article><article><strong>Easy history</strong><span>Your upcoming tickets in one place.</span></article></section></>;
}
