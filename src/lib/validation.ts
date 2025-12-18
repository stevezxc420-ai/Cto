import type { AppSettings, DashboardStats, User } from '../types/api';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

/**
 * Parse/validate a `/users` response at runtime.
 *
 * This protects the UI from crashing if the backend returns an unexpected shape.
 */
export const parseUsers = (value: unknown): User[] => {
  if (!Array.isArray(value)) return [];

  const users: User[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;

    const { id, name, email, role, status, lastLogin } = item;

    if (!isNumber(id)) continue;
    if (!isString(name)) continue;
    if (!isString(email)) continue;
    if (role !== 'Admin' && role !== 'Editor' && role !== 'Viewer') continue;
    if (status !== 'Active' && status !== 'Inactive') continue;
    if (!isString(lastLogin)) continue;

    users.push({ id, name, email, role, status, lastLogin });
  }

  return users;
};

/**
 * Parse/validate a `/dashboard/stats` response at runtime.
 */
export const parseDashboardStats = (value: unknown): DashboardStats | null => {
  if (!isRecord(value)) return null;

  const { totalUsers, totalRevenue, monthlyGrowth, issues } = value;

  if (!isNumber(totalUsers)) return null;
  if (!isNumber(totalRevenue)) return null;
  if (!isNumber(monthlyGrowth)) return null;
  if (!isNumber(issues)) return null;

  return { totalUsers, totalRevenue, monthlyGrowth, issues };
};

/**
 * Parse/validate a `/settings` response at runtime.
 */
export const parseAppSettings = (value: unknown): AppSettings | null => {
  if (!isRecord(value)) return null;

  const { notifications, emailAlerts, theme, language, timezone } = value;

  if (!isBoolean(notifications)) return null;
  if (!isBoolean(emailAlerts)) return null;
  if (theme !== 'light' && theme !== 'dark') return null;
  if (!isString(language)) return null;
  if (!isString(timezone)) return null;

  return { notifications, emailAlerts, theme, language, timezone };
};
