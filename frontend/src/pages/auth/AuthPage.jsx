import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { errorMessage } from '../../services/http/httpClient';

export default function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = isRegister ? { name: form.name, email: form.email, password: form.password, ...(form.phone ? { phone: form.phone } : {}) } : { email: form.email, password: form.password };
      const user = await (isRegister ? register(payload) : login(payload));
      navigate(user.role === 'admin' ? '/admin' : (location.state?.from || '/movies'), { replace: true });
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return <div className="auth-card"><div className="eyebrow">Welcome to IMovies</div><h1>{isRegister ? 'Create your account' : 'Log in'}</h1>{error && <div className="alert alert-danger">{error}</div>}<form onSubmit={submit} className="vstack gap-3">
    {isRegister && <><label className="form-label">Full name<input className="form-control" required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="form-label">Phone (optional)<input className="form-control" placeholder="+919876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label></>}
    <label className="form-label">Email<input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
    <label className="form-label">Password<input className="form-control" type="password" required minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
    <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
  </form><p className="mt-3 mb-0">{isRegister ? 'Already registered?' : 'New to IMovies?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create account'}</Link></p></div>;
}
