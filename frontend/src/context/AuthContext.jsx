import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nexora_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [businessId, setBusinessId] = useState(() =>
    localStorage.getItem('nexora_business_id')
  );

  const [loading, setLoading] = useState(true);

  // Setiap kali app dibuka, cek ulang apakah token masih valid
  // dan pastikan sudah tahu business_id yang aktif.
  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem('nexora_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await api.get('/auth/me');
        setUser(me.data ?? me);
        localStorage.setItem('nexora_user', JSON.stringify(me.data ?? me));

        // Kalau belum ada business_id tersimpan, ambil bisnis pertama
        // milik user ini.
        if (!localStorage.getItem('nexora_business_id')) {
          const businesses = await api.get('/businesses');
          const first = businesses.data?.[0];
          if (first) {
            setBusinessId(String(first.id));
            localStorage.setItem('nexora_business_id', String(first.id));
          }
        }
      } catch (err) {
        // Token invalid — api.js sudah otomatis bersih-bersih & redirect
        console.error('Gagal memuat sesi:', err.message);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data?.token ?? res.token;
    const loggedInUser = res.data?.user ?? res.user;

    localStorage.setItem('nexora_token', token);
    localStorage.setItem('nexora_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    // Ambil daftar bisnis milik user, pakai yang pertama sebagai default.
    // Kalau belum punya bisnis sama sekali, biarkan kosong — halaman
    // Dashboard/dst. perlu menangani kondisi "belum ada bisnis" ini.
    const businesses = await api.get('/businesses');
    const first = businesses.data?.[0];
    if (first) {
      setBusinessId(String(first.id));
      localStorage.setItem('nexora_business_id', String(first.id));
    }

    return loggedInUser;
  }

  async function register(name, email, password) {
    await api.post('/auth/register', { name, email, password });
    // Setelah register, langsung login supaya dapat token
    return login(email, password);
  }

  async function loginWithGoogle(googleData) {
    const res = await api.post('/auth/google', googleData);
    const token = res.data?.token ?? res.token;
    const loggedInUser = res.data?.user ?? res.user;

    localStorage.setItem('nexora_token', token);
    localStorage.setItem('nexora_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    const bizId = res.data?.business_id ?? res.business_id;
    if (bizId) {
      setBusinessId(String(bizId));
      localStorage.setItem('nexora_business_id', String(bizId));
    } else {
      try {
        const businesses = await api.get('/businesses');
        const first = businesses.data?.[0];
        if (first) {
          setBusinessId(String(first.id));
          localStorage.setItem('nexora_business_id', String(first.id));
        }
      } catch (e) {
        console.warn('Could not fetch businesses:', e);
      }
    }

    return loggedInUser;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Abaikan error logout (misal token sudah expired duluan)
    }
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    localStorage.removeItem('nexora_business_id');
    setUser(null);
    setBusinessId(null);
  }

  async function createBusiness(payload) {
    const res = await api.post('/businesses', payload);
    const created = res.data;
    setBusinessId(String(created.id));
    localStorage.setItem('nexora_business_id', String(created.id));
    return created;
  }

  const value = {
    user,
    businessId,
    isAuthenticated: !!user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    createBusiness,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  }
  return ctx;
}
