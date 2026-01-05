/**
 * User Preferences Service
 * API calls for user preferences management
 */
import axios from 'axios';

import type { BodyType, Occasion, StylePreference } from '@/components/onboarding';
import { API_ENDPOINTS } from '@/constants/api';
import { apiClient } from '@/services/apiClient';

// Request/Response types
export interface UserPreferencesRequest {
  bodyType: BodyType;
  styles: StylePreference[];
  occasions: Occasion[];
}

export interface UserPreferencesResponse {
  id: string;
  userId: string;
  bodyType: BodyType;
  styles: StylePreference[];
  occasions: Occasion[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * User Preferences Service
 */
export const userPreferencesService = {
  /**
   * Save user preferences
   */
  async savePreferences(preferences: UserPreferencesRequest): Promise<UserPreferencesResponse> {
    try {
      const { data } = await apiClient.put<UserPreferencesResponse>(
        API_ENDPOINTS.users.preferences,
        preferences
      );
      return data;
    } catch (error) {
      throw parseApiError(error);
    }
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferencesResponse | null> {
    try {
      const { data } = await apiClient.get<UserPreferencesResponse>(
        API_ENDPOINTS.users.preferences
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No preferences set yet
      }
      throw parseApiError(error);
    }
  },
};

/**
 * Parse API error response
 */
function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data) {
      return error.response.data;
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
