import { getJwtExpirationMs } from './jwt';

const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'auth_token';

export interface AuthToken {
  token: string;
  refreshToken?: string;
  /**
   * Expiration timestamp in epoch milliseconds.
   *
   * If omitted, the JWT `exp` claim will be used when available.
   */
  expiresAt?: number;
}

const isAuthToken = (value: unknown): value is AuthToken => {
  if (typeof value !== 'object' || value === null) return false;

  const v = value as Record<string, unknown>;
  if (typeof v.token !== 'string' || v.token.length === 0) return false;

  if (v.refreshToken !== undefined && typeof v.refreshToken !== 'string') return false;
  if (v.expiresAt !== undefined && (typeof v.expiresAt !== 'number' || !Number.isFinite(v.expiresAt))) {
    return false;
  }

  return true;
};

const getStoredTokenData = (): AuthToken | null => {
  try {
    const tokenString = localStorage.getItem(TOKEN_KEY);
    if (!tokenString) return null;

    const parsed: unknown = JSON.parse(tokenString);
    if (!isAuthToken(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
};

const isExpired = (tokenData: AuthToken): boolean => {
  const expiresAt = tokenData.expiresAt ?? getJwtExpirationMs(tokenData.token);
  return typeof expiresAt === 'number' && Date.now() > expiresAt;
};

export const setToken = (tokenData: AuthToken): void => {
  try {
    const tokenString = JSON.stringify(tokenData);
    localStorage.setItem(TOKEN_KEY, tokenString);
  } catch {
    // Swallow storage errors (e.g., blocked cookies/localStorage).
  }
};

export const getToken = (): string | null => {
  const tokenData = getStoredTokenData();
  if (!tokenData) return null;

  if (isExpired(tokenData)) {
    removeToken();
    return null;
  }

  return tokenData.token;
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Swallow storage errors.
  }
};

export const getRefreshToken = (): string | null => {
  const tokenData = getStoredTokenData();
  if (!tokenData) return null;

  if (isExpired(tokenData)) {
    removeToken();
    return null;
  }

  return tokenData.refreshToken ?? null;
};

export const isAuthenticated = (): boolean => getToken() !== null;
