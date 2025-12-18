export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  issues: number;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  notifications: boolean;
  emailAlerts: boolean;
  theme: Exclude<ThemePreference, 'system'>;
  language: string;
  timezone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}
