/**
 * Auth Service
 * Authentication API calls for SMS login
 */
import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from '@/constants/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// API response types
export interface TokenResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SendSMSResponse {
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: {
    retryAfter?: number;
    attemptsRemaining?: number;
  };
}

// Phone validation regex (China mainland: starts with 1, followed by 3-9, then 9 digits)
const CHINA_PHONE_REGEX = /^1[3-9]\d{9}$/;

/**
 * Validate Chinese phone number
 */
export function isValidPhone(phone: string): boolean {
  return CHINA_PHONE_REGEX.test(phone);
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Auth service for SMS-based authentication
 */
export const authService = {
  /**
   * Send SMS verification code to phone number
   */
  async sendSMS(phone: string): Promise<SendSMSResponse> {
    try {
      const { data } = await apiClient.post<SendSMSResponse>(
        API_ENDPOINTS.auth.sendSms,
        { phone }
      );
      return data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Verify SMS code and authenticate user
   */
  async verifySMS(phone: string, code: string): Promise<TokenResponse> {
    try {
      const { data } = await apiClient.post<TokenResponse>(
        API_ENDPOINTS.auth.verifySms,
        { phone, code }
      );
      await this.storeTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Refresh access token using refresh token
   * Returns new tokens and stores them
   */
  async refreshTokens(): Promise<RefreshTokenResponse | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const { data } = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.auth.refresh,
        { refreshToken }
      );

      // Store new tokens
      await this.storeTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      // Clear tokens if refresh fails (token expired or invalid)
      await this.clearTokens();
      return null;
    }
  },

  /**
   * Store tokens securely
   */
  async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  /**
   * Clear stored tokens (logout)
   */
  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },

  /**
   * Check if user has stored tokens
   */
  async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return accessToken !== null;
  },

  /**
   * Check if access token is expired
   * Returns true if token is expired or will expire within 60 seconds
   */
  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const exp = payload.exp;

      if (!exp) return true;

      // Check if token expires within 60 seconds (buffer time)
      const now = Math.floor(Date.now() / 1000);
      return exp <= now + 60;
    } catch {
      return true;
    }
  },

  /**
   * Get a valid access token, refreshing if needed
   * Returns null if no valid token can be obtained
   */
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = await this.getAccessToken();

    // No token stored
    if (!accessToken) {
      return null;
    }

    // Token is still valid
    if (!this.isTokenExpired(accessToken)) {
      return accessToken;
    }

    // Token expired, try to refresh
    const refreshResult = await this.refreshTokens();
    return refreshResult?.accessToken ?? null;
  },

  /**
   * Get user ID from stored access token
   * Parses the JWT payload to extract the user ID
   */
  async getUserIdFromToken(): Promise<string | null> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return null;

    try {
      // JWT is base64url encoded: header.payload.signature
      const parts = accessToken.split('.');
      if (parts.length !== 3) return null;

      // Decode the payload (second part)
      // Handle base64url encoding (replace - with + and _ with /)
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload.sub || null;
    } catch {
      // Invalid token format
      return null;
    }
  },
};

/**
 * Parse API error response
 */
function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: ApiError }>;
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    const data = axiosError.response?.data as ApiError | undefined;
    if (data?.code && data?.message) {
      return data;
    }
    // Network or timeout error
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络后重试',
    };
  }
  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: '发生未知错误，请稍后重试',
  };
}
