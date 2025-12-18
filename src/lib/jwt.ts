export interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

const base64UrlDecode = (input: string): string | null => {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return atob(padded);
  } catch {
    return null;
  }
};

/**
 * Decodes the JWT payload without verifying the signature.
 *
 * This is safe to use for UX decisions (like token expiration checks), but must
 * not be used for authorization decisions.
 */
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const payloadRaw = base64UrlDecode(parts[1]);
  if (!payloadRaw) return null;

  try {
    const parsed: unknown = JSON.parse(payloadRaw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Returns the JWT expiration time in epoch milliseconds, if available.
 */
export const getJwtExpirationMs = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;

  const expMs = payload.exp * 1000;
  if (!Number.isFinite(expMs)) return null;

  return expMs;
};
