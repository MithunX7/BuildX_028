import { apiClient } from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'COMMANDER' | 'COORDINATOR' | 'INSPECTOR' | 'VERIFIER' | 'OPERATOR' | 'CITIZEN' | 'ADMIN';
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

  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignored
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
};
