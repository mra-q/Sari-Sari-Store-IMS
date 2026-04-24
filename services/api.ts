import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

export const API_TIMEOUT = 30000;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions extends Omit<RequestInit, 'method'> {
  method?: RequestMethod;
  headers?: Record<string, string>;
}

export const buildApiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const tryRefreshToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(buildApiUrl('/auth/refresh/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (!data?.access) {
        return false;
      }

      await AsyncStorage.setItem('access_token', data.access);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  const { method = 'GET', headers, body, ...rest } = options;
  const token = await AsyncStorage.getItem('access_token');

  const makeRequest = async () =>
    fetch(buildApiUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      body,
      signal: controller.signal,
      ...rest,
    });

  try {
    let response = await makeRequest();

    if (response.status === 401) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        throw new ApiError(401, 'Session expired. Please log in again.');
      }

      const updatedToken = await AsyncStorage.getItem('access_token');
      response = await fetch(buildApiUrl(path), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(updatedToken ? { Authorization: `Bearer ${updatedToken}` } : {}),
          ...(headers ?? {}),
        },
        body,
        signal: controller.signal,
        ...rest,
      });
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.detail ??
        errorBody?.message ??
        errorBody?.error?.detail ??
        (errorBody && typeof errorBody === 'object'
          ? Object.entries(errorBody)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join(' | ')
          : null) ??
        `API error: ${response.status}`;
      throw new ApiError(response.status, message, errorBody);
    }

    if (response.status === 204) return null as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout - server took too long to respond');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
