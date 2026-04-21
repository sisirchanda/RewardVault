'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, setToken, clearToken } from '@/lib/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const u = await api.auth.me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
	  setLoading(false);
	}
		
  }

  useEffect(() => {
    const token = localStorage.getItem('rv_token');
    if (token) {
      refresh().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api.auth.login({ email, password });
    setToken(res.token);
    setUser(res.user as any);
  }

  function logout() {
    clearToken();
    setUser(null);
    window.location.href = '/';
  }

  return <Ctx.Provider value={{ user, loading, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
