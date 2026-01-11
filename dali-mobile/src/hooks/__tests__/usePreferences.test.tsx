/**
 * usePreferences Hook Tests
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see AC#3: Preferences Data API Integration
 * @see AC#5: Preferences Save and Sync
 */
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  usePreferences,
  useUpdatePreferences,
  usePreferencesNeedUpdate,
  preferenceKeys,
  transformToCloudTags,
} from '../usePreferences';
import { userPreferencesService } from '@/services/userPreferencesService';

// =============================================================================
// Mocks
// =============================================================================

jest.mock('@/services/userPreferencesService', () => ({
  userPreferencesService: {
    getPreferences: jest.fn(),
    savePreferences: jest.fn(),
  },
}));

const mockedService = userPreferencesService as jest.Mocked<typeof userPreferencesService>;

// =============================================================================
// Test Utilities
// =============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

// =============================================================================
// Test Data
// =============================================================================

const mockPreferencesResponse = {
  id: 'pref-123',
  userId: 'user-456',
  bodyType: '梨形' as const,
  styles: ['简约', '通勤', '知性'],
  occasions: ['上班', '约会'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',
  inferredTags: [
    { tag: '黑白配色', weight: 0.8 },
    { tag: '阔腿裤', weight: 0.6 },
    { tag: '经典款', weight: 0.3 },
  ],
};

// =============================================================================
// Tests
// =============================================================================

describe('usePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('query', () => {
    it('should fetch preferences successfully', async () => {
      mockedService.getPreferences.mockResolvedValueOnce(mockPreferencesResponse);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePreferences(), { wrapper: Wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPreferencesResponse);
      expect(mockedService.getPreferences).toHaveBeenCalledTimes(1);
    });

    it('should return null when no preferences exist', async () => {
      mockedService.getPreferences.mockResolvedValueOnce(null);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePreferences(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should handle error gracefully', async () => {
      const error = new Error('Network error');
      mockedService.getPreferences.mockRejectedValueOnce(error);

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => usePreferences(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('preferenceKeys', () => {
    it('should generate correct query keys', () => {
      expect(preferenceKeys.all).toEqual(['preferences']);
      expect(preferenceKeys.detail()).toEqual(['preferences', 'detail']);
    });
  });
});

describe('useUpdatePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update preferences successfully', async () => {
    mockedService.savePreferences.mockResolvedValueOnce(mockPreferencesResponse);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdatePreferences(), { wrapper: Wrapper });

    const updateData = {
      bodyType: '梨形' as const,
      styles: ['简约', '时尚'],
      occasions: ['上班', '聚会'],
    };

    await act(async () => {
      await result.current.mutateAsync(updateData);
    });

    // Verify the service was called with correct data
    expect(mockedService.savePreferences).toHaveBeenCalledWith(updateData);
    expect(mockedService.savePreferences).toHaveBeenCalledTimes(1);
  });

  it('should invalidate queries on success', async () => {
    mockedService.savePreferences.mockResolvedValueOnce(mockPreferencesResponse);

    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdatePreferences(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        bodyType: '梨形' as const,
        styles: ['简约'],
        occasions: ['上班'],
      });
    });

    // Verify invalidateQueries was called with correct key
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it('should handle update error', async () => {
    const error = { code: 'VALIDATION_ERROR', message: 'Invalid data' };
    mockedService.savePreferences.mockRejectedValueOnce(error);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdatePreferences(), { wrapper: Wrapper });

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.mutateAsync({
          bodyType: '梨形' as const,
          styles: ['简约'],
          occasions: ['上班'],
        });
      } catch (e) {
        caughtError = e;
      }
    });

    // Verify error was thrown
    expect(caughtError).toBeDefined();
  });
});

describe('usePreferencesNeedUpdate', () => {
  it('should return false when updatedAt is undefined', () => {
    expect(usePreferencesNeedUpdate(undefined)).toBe(false);
  });

  it('should return false when last update was less than 30 days ago', () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    expect(usePreferencesNeedUpdate(tenDaysAgo.toISOString())).toBe(false);
  });

  it('should return false when last update was exactly 30 days ago', () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    expect(usePreferencesNeedUpdate(thirtyDaysAgo.toISOString())).toBe(false);
  });

  it('should return true when last update was more than 30 days ago', () => {
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);
    expect(usePreferencesNeedUpdate(fortyDaysAgo.toISOString())).toBe(true);
  });

  it('should return true when last update was 31 days ago', () => {
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    expect(usePreferencesNeedUpdate(thirtyOneDaysAgo.toISOString())).toBe(true);
  });
});

describe('transformToCloudTags', () => {
  it('should return empty array when preferences is null', () => {
    expect(transformToCloudTags(null)).toEqual([]);
  });

  it('should return empty array when preferences is undefined', () => {
    expect(transformToCloudTags(undefined)).toEqual([]);
  });

  it('should transform styles to user type tags', () => {
    const preferences = {
      id: 'pref-123',
      userId: 'user-456',
      bodyType: '梨形' as const,
      styles: ['简约', '通勤'],
      occasions: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const result = transformToCloudTags(preferences);

    const styleTags = result.filter(t => t.tag === '简约' || t.tag === '通勤');
    expect(styleTags).toHaveLength(2);
    styleTags.forEach(tag => {
      expect(tag.type).toBe('user');
    });
  });

  it('should transform occasions to user type tags', () => {
    const preferences = {
      id: 'pref-123',
      userId: 'user-456',
      bodyType: '梨形' as const,
      styles: [],
      occasions: ['上班', '约会'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const result = transformToCloudTags(preferences);

    const occasionTags = result.filter(t => t.tag === '上班' || t.tag === '约会');
    expect(occasionTags).toHaveLength(2);
    occasionTags.forEach(tag => {
      expect(tag.type).toBe('user');
    });
  });

  it('should include bodyType as a user tag', () => {
    const preferences = {
      id: 'pref-123',
      userId: 'user-456',
      bodyType: '梨形' as const,
      styles: [],
      occasions: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const result = transformToCloudTags(preferences);

    const bodyTypeTag = result.find(t => t.tag === '梨形');
    expect(bodyTypeTag).toBeDefined();
    expect(bodyTypeTag?.type).toBe('user');
    expect(bodyTypeTag?.weight).toBe(0.85);
  });

  it('should transform inferredTags to inferred type tags', () => {
    const preferences = {
      id: 'pref-123',
      userId: 'user-456',
      bodyType: '梨形' as const,
      styles: [],
      occasions: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      inferredTags: [
        { tag: '黑白配色', weight: 0.8 },
        { tag: '阔腿裤', weight: 0.6 },
      ],
    };

    const result = transformToCloudTags(preferences);

    const inferredTags = result.filter(t => t.type === 'inferred');
    expect(inferredTags).toHaveLength(2);
    expect(inferredTags.find(t => t.tag === '黑白配色')?.weight).toBe(0.8);
  });

  it('should sort tags by weight in descending order', () => {
    const preferences = {
      id: 'pref-123',
      userId: 'user-456',
      bodyType: '梨形' as const,
      styles: ['简约'],
      occasions: ['上班'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      inferredTags: [{ tag: '阔腿裤', weight: 0.3 }],
    };

    const result = transformToCloudTags(preferences);

    // Verify sorted by weight descending
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].weight).toBeGreaterThanOrEqual(result[i + 1].weight);
    }
  });

  it('should handle full preferences object correctly', () => {
    const result = transformToCloudTags(mockPreferencesResponse);

    // Should have all tags
    expect(result.length).toBeGreaterThan(0);

    // Check user tags
    const userTags = result.filter(t => t.type === 'user');
    expect(userTags.length).toBeGreaterThan(0);

    // Check inferred tags
    const inferredTags = result.filter(t => t.type === 'inferred');
    expect(inferredTags.length).toBe(3);
  });
});
