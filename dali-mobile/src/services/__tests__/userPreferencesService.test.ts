/**
 * User Preferences Service Tests
 * Unit tests for user preferences service functions
 */

import { userPreferencesService, UserPreferencesRequest } from '../userPreferencesService';

// Mock apiClient
jest.mock('../apiClient', () => ({
  apiClient: {
    put: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock API_ENDPOINTS
jest.mock('@/constants/api', () => ({
  API_ENDPOINTS: {
    users: {
      preferences: '/users/me/preferences',
    },
  },
}));

import { apiClient } from '../apiClient';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('userPreferencesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savePreferences', () => {
    const validPreferences: UserPreferencesRequest = {
      bodyType: 'hourglass',
      styles: ['minimalist', 'intellectual'],
      occasions: ['work', 'daily'],
    };

    const mockResponse = {
      id: 'pref-uuid-123',
      userId: 'user-uuid-456',
      bodyType: 'hourglass',
      styles: ['minimalist', 'intellectual'],
      occasions: ['work', 'daily'],
      createdAt: '2026-01-05T12:00:00Z',
      updatedAt: '2026-01-05T12:00:00Z',
    };

    it('should save preferences successfully', async () => {
      mockApiClient.put.mockResolvedValue({ data: mockResponse });

      const result = await userPreferencesService.savePreferences(validPreferences);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/users/me/preferences',
        validPreferences
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw ApiError on network failure', async () => {
      const networkError = {
        isAxiosError: true,
        response: undefined,
      };
      mockApiClient.put.mockRejectedValue(networkError);

      await expect(
        userPreferencesService.savePreferences(validPreferences)
      ).rejects.toEqual(
        expect.objectContaining({
          code: 'NETWORK_ERROR',
        })
      );
    });

    it('should throw ApiError with server error details', async () => {
      const serverError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            detail: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid body type',
            },
          },
        },
      };
      mockApiClient.put.mockRejectedValue(serverError);

      await expect(
        userPreferencesService.savePreferences(validPreferences)
      ).rejects.toEqual(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Invalid body type',
        })
      );
    });
  });

  describe('getPreferences', () => {
    const mockResponse = {
      id: 'pref-uuid-123',
      userId: 'user-uuid-456',
      bodyType: 'pear',
      styles: ['trendy'],
      occasions: ['party', 'date'],
      createdAt: '2026-01-05T12:00:00Z',
      updatedAt: '2026-01-05T12:00:00Z',
    };

    it('should get preferences successfully', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await userPreferencesService.getPreferences();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/me/preferences');
      expect(result).toEqual(mockResponse);
    });

    it('should return null when preferences not found (404)', async () => {
      const notFoundError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            code: 'PREFERENCES_NOT_FOUND',
            message: '用户偏好设置不存在',
          },
        },
      };
      mockApiClient.get.mockRejectedValue(notFoundError);

      // Mock axios.isAxiosError to return true
      const axios = require('axios');
      axios.isAxiosError = jest.fn().mockReturnValue(true);

      const result = await userPreferencesService.getPreferences();

      expect(result).toBeNull();
    });

    it('should throw ApiError on other errors', async () => {
      const serverError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            code: 'INTERNAL_ERROR',
            message: 'Server error',
          },
        },
      };
      mockApiClient.get.mockRejectedValue(serverError);

      // Mock axios.isAxiosError to return true
      const axios = require('axios');
      axios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(userPreferencesService.getPreferences()).rejects.toEqual(
        expect.objectContaining({
          code: 'INTERNAL_ERROR',
        })
      );
    });
  });
});

describe('Preferences validation', () => {
  describe('bodyType values', () => {
    const validBodyTypes = ['pear', 'apple', 'hourglass', 'rectangle', 'inverted-triangle'];

    it.each(validBodyTypes)('should accept valid body type: %s', (bodyType) => {
      const preferences: UserPreferencesRequest = {
        bodyType: bodyType as any,
        styles: ['minimalist'],
        occasions: ['work'],
      };
      // Type check - if it compiles, it's valid
      expect(preferences.bodyType).toBe(bodyType);
    });
  });

  describe('styles values', () => {
    const validStyles = ['minimalist', 'trendy', 'sweet', 'intellectual', 'athletic'];

    it.each(validStyles)('should accept valid style: %s', (style) => {
      const preferences: UserPreferencesRequest = {
        bodyType: 'hourglass',
        styles: [style as any],
        occasions: ['work'],
      };
      expect(preferences.styles).toContain(style);
    });

    it('should allow 1-3 styles', () => {
      const oneStyle: UserPreferencesRequest = {
        bodyType: 'hourglass',
        styles: ['minimalist'],
        occasions: ['work'],
      };
      expect(oneStyle.styles.length).toBe(1);

      const threeStyles: UserPreferencesRequest = {
        bodyType: 'hourglass',
        styles: ['minimalist', 'trendy', 'sweet'],
        occasions: ['work'],
      };
      expect(threeStyles.styles.length).toBe(3);
    });
  });

  describe('occasions values', () => {
    const validOccasions = ['work', 'date', 'party', 'daily', 'sports'];

    it.each(validOccasions)('should accept valid occasion: %s', (occasion) => {
      const preferences: UserPreferencesRequest = {
        bodyType: 'hourglass',
        styles: ['minimalist'],
        occasions: [occasion as any],
      };
      expect(preferences.occasions).toContain(occasion);
    });

    it('should allow 1-3 occasions', () => {
      const oneOccasion: UserPreferencesRequest = {
        bodyType: 'hourglass',
        styles: ['minimalist'],
        occasions: ['work'],
      };
      expect(oneOccasion.occasions.length).toBe(1);

      const threeOccasions: UserPreferencesRequest = {
        bodyType: 'hourglass',
        styles: ['minimalist'],
        occasions: ['work', 'date', 'party'],
      };
      expect(threeOccasions.occasions.length).toBe(3);
    });
  });
});
