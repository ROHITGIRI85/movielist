import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../services/api/api';
import { setAccessToken } from '../../services/http/httpClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const applySession = useCallback((data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener('imovies:session-expired', expire);
    authApi.refresh().then(({ data }) => applySession(data.data)).catch(() => setAccessToken(null)).finally(() => setReady(true));
    return () => window.removeEventListener('imovies:session-expired', expire);
  }, [applySession]);

  const login = async (payload) => { const { data } = await authApi.login(payload); applySession(data.data); return data.data.user; };
  const register = async (payload) => { const { data } = await authApi.register(payload); applySession(data.data); return data.data.user; };
  const logout = async () => { try { await authApi.logout(); } finally { setAccessToken(null); setUser(null); } };
  const updateProfile = async (payload) => { const { data } = await authApi.updateProfile(payload); setUser(data.data.user); return data.data.user; };

  const value = useMemo(() => ({ user, ready, login, register, logout, updateProfile }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
