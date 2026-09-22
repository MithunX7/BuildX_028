import { apiClient } from './apiClient';
import { isAdminRole } from '../types/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const data = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('nagpur_civic_token', data.token);
      localStorage.setItem('nagpur_civic_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<LoginResponse> => {
    const data = await apiClient.post<LoginResponse>('/auth/register', payload);
    if (data.token) {
      localStorage.setItem('nagpur_civic_token', data.token);
      localStorage.setItem('nagpur_civic_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    if (res.user) {
      localStorage.setItem('nagpur_civic_user', JSON.stringify(res.user));
    }
    return res;
  },

  updateProfile: async (payload: { name?: string; phone?: string }): Promise<{ user: User; message: string }> => {
    const res = await apiClient.put<{ user: User; message: string }>('/auth/profile', payload);
    if (res.user) {
      const stored = authService.getStoredUser();
      const updated = { ...stored, ...res.user };
      localStorage.setItem('nagpur_civic_user', JSON.stringify(updated));
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('nagpur_civic_token');
      localStorage.removeItem('nagpur_civic_user');
    }
  },

  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('nagpur_civic_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('nagpur_civic_token');
  },

  isAdmin: (): boolean => {
    const user = authService.getStoredUser();
    if (!user) return false;
    return user.role === 'ADMIN' || isAdminRole(user.role);
  },
};
