import type { AxiosError } from 'axios';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Normalizes unknown errors (Axios/network/runtime) into a safe `ApiError`.
 *
 * Avoid passing through raw Axios errors to prevent accidentally exposing
 * request headers or other sensitive details in UI.
 */
export const normalizeApiError = (error: unknown): ApiError => {
  const maybeAxios = error as AxiosError | undefined;
  const status = maybeAxios?.response?.status;

  if (typeof status === 'number') {
    if (status === 401) return new ApiError('Unauthorized', 401);
    if (status === 403) return new ApiError('Forbidden', 403);
    if (status === 404) return new ApiError('Not found', 404);
    if (status >= 500) return new ApiError('Server error', status);

    return new ApiError('Request failed', status);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Unexpected error');
};
