import { create } from 'zustand';
import api from '@/lib/api';
import type { User, LoginCredentials, RegisterCredentials } from '@/types';
import axios from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('edo_token') : null,
  isLoading: true,
  isAuthenticated: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data: res } = await api.post('/auth/login', credentials);
      const { token, user } = res.data;
      localStorage.setItem('edo_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data: res } = await api.post('/auth/register', credentials);
      const { token, user } = res.data;
      localStorage.setItem('edo_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('edo_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('edo_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const { data: res } = await api.get('/auth/me');
      set({ user: res.data.user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Only invalidate the session when the server explicitly rejects the
      // token (401 Unauthorized). Any other failure — network timeout, 5xx
      // server error, Render cold-start, etc. — should leave the stored
      // token intact so the user stays logged in and can retry on next load.
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('edo_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      } else {
        // Non-401 error: keep the token, treat user as still authenticated
        // so they aren't bounced to the login page over a transient outage.
        set({ isAuthenticated: true, isLoading: false });
      }
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
