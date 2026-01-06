import { api } from './api';
import { setToken, removeToken } from './token';
import { mockAuthAPI } from './mockAuth';
import { LoginRequest, SignupRequest, AuthResponse, User } from '../types/auth';

const USE_MOCK_API = !process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost:8000');

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      let response: AuthResponse;
      
      if (USE_MOCK_API) {
        response = await mockAuthAPI.login(credentials);
      } else {
        response = await api.post<AuthResponse>('/auth/login', credentials);
      }
      
      // Calculate expiration time (default 7 days if rememberMe, otherwise 1 day)
      const expiresIn = credentials.rememberMe 
        ? 7 * 24 * 60 * 60 * 1000  // 7 days
        : 24 * 60 * 60 * 1000;     // 1 day
      
      const expiresAt = Date.now() + (response.expiresIn || expiresIn);
      
      // Store token with expiration
      setToken({
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt,
      });
      
      // Store user data separately
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  },

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      let response: AuthResponse;
      
      if (USE_MOCK_API) {
        response = await mockAuthAPI.signup(userData);
      } else {
        response = await api.post<AuthResponse>('/auth/signup', userData);
      }
      
      // Default expiration: 1 day
      const expiresAt = Date.now() + (response.expiresIn || 24 * 60 * 60 * 1000);
      
      // Store token
      setToken({
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt,
      });
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || error.response?.data?.message || 'Signup failed. Please try again.');
    }
  },

  logout(): void {
    removeToken();
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return null;
      return JSON.parse(userString);
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },
};
