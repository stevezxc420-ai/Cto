const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'auth_token';

export interface AuthToken {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

export const setToken = (tokenData: AuthToken): void => {
  try {
    const tokenString = JSON.stringify(tokenData);
    localStorage.setItem(TOKEN_KEY, tokenString);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

export const getToken = (): string | null => {
  try {
    const tokenString = localStorage.getItem(TOKEN_KEY);
    if (!tokenString) return null;

    const tokenData: AuthToken = JSON.parse(tokenString);
    
    // Check if token has expired
    if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
      removeToken();
      return null;
    }
    
    return tokenData.token;
  } catch (error) {
    console.error('Failed to get token:', error);
    removeToken();
    return null;
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

export const getRefreshToken = (): string | null => {
  try {
    const tokenString = localStorage.getItem(TOKEN_KEY);
    if (!tokenString) return null;

    const tokenData: AuthToken = JSON.parse(tokenString);
    return tokenData.refreshToken || null;
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};