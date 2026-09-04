import { api } from './api';
import { User } from '../types';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  profile?: any;
}

export const authService = {
  async register(data: any): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User; profile: any }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('pfis_auth_token');
      localStorage.removeItem('pfis_auth_user');
    }
  },
};
