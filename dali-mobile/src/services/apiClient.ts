/**
 * API Client with Token Auto-Refresh and Offline Handling
 * Axios instance with interceptors for automatic token refresh on 401 errors
 * and user-friendly offline error messages
 *
 * @see Story 8.2: AC#9 - API Request Offline Fallback
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, API_TIMEOUT } from '@/constants/api';
import { authService } from '@/services/authService';
import { categorizeNetworkError } from '@/hooks/useOfflineMode';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of requests waiting for token refresh
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// Callback for when auth fails completely (to trigger logout)
let onAuthFailure: (() => void) | null = null;

/**
 * Set callback for auth failure (called when refresh token fails)
 * This allows the app to trigger logout without circular dependencies
 */
export function setOnAuthFailure(callback: () => void) {
  onAuthFailure = callback;
}

/**
 * Process the queue of waiting requests after token refresh
 */
function processQueue(error: Error | null, token: string | null = null) {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
}

/**
 * Request interceptor - add Authorization header
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth header for public endpoints (login, refresh, send SMS)
    const publicEndpoints = ['/auth/sms/send', '/auth/sms/verify', '/auth/refresh'];
    const isPublic = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

    if (!isPublic) {
      const token = await authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handle 401 errors, refresh tokens, and offline errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check for offline/network errors first (AC#9)
    const offlineError = categorizeNetworkError(error);
    if (offlineError.isOfflineError) {
      // Create a user-friendly error with the offline message
      const friendlyError = new Error(offlineError.userMessage);
      (friendlyError as Error & { isOffline: boolean }).isOffline = true;
      (friendlyError as Error & { originalError: unknown }).originalError = error;
      return Promise.reject(friendlyError);
    }

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry if already retried or if it's a refresh token request
    if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const result = await authService.refreshTokens();

      if (!result) {
        // Refresh failed, clear queue and reject
        processQueue(new Error('Token refresh failed'), null);
        // Trigger logout callback if set
        if (onAuthFailure) {
          onAuthFailure();
        }
        return Promise.reject(error);
      }

      // Refresh successful, process queue
      processQueue(null, result.accessToken);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
