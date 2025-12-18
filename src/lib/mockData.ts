import type { AppSettings, DashboardStats, User } from '../types/api';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-12-17',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    status: 'Active',
    lastLogin: '2024-12-16',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Viewer',
    status: 'Inactive',
    lastLogin: '2024-12-15',
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Editor',
    status: 'Active',
    lastLogin: '2024-12-17',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalUsers: 1234,
  totalRevenue: 12345,
  monthlyGrowth: 12.5,
  issues: 23,
};

export const mockSettings: AppSettings = {
  notifications: true,
  emailAlerts: false,
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
};
