import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem('ts_user')); } catch { return null; }
  })(),
  token: localStorage.getItem('ts_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('ts_token', data.token);
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('ts_token');
    localStorage.removeItem('ts_user');
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {}
  },

  setUser: (user) => {
    localStorage.setItem('ts_user', JSON.stringify(user));
    set({ user });
  }
}));

export default useAuthStore;
