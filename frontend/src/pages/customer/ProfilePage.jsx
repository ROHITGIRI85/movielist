import { useState } from 'react';
import { useAuth } from '../../context/auth/AuthContext';
import { errorMessage } from '../../services/http/httpClient';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth(); const [form, setForm] = useState({ name: user.name, phone: user.phone || '' }); const [message, setMessage] = useState('');
  const submit = async (event) => { event.preventDefault(); try { await updateProfile(form); setMessage('Profile saved.'); } catch (err) { setMessage(errorMessage(err)); } };
  return <div className="form-card"><h1>Your profile</h1>{message && <div className="alert alert-info">{message}</div>}<form onSubmit={submit} className="vstack gap-3"><label>Name<input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email<input className="form-control" value={user.email} disabled /></label><label>Phone<input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><button className="btn btn-primary">Save profile</button></form></div>;
}
