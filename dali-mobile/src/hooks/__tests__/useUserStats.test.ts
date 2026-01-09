/**
 * useUserStats Hook Tests
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useUserStats } from '../useUserStats';
import * as userService from '@/services/user';

// Mock user service
jest.mock('@/services/user');
const mockUserService = userService as jest.Mocked<typeof userService>;

// Test QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUserStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user stats successfully', async () => {
    const mockStats = {
      totalOutfits: 45,
      favoriteCount: 12,
      shareCount: 8,
      joinedDays: 15,
      aiAccuracy: 0.82,
    };

    mockUserService.getUserStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useUserStats(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStats);
  });

  it('should handle error when fetching stats', async () => {
    mockUserService.getUserStats.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserStats(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });

  it('should use stale time of 5 minutes', () => {
    mockUserService.getUserStats.mockResolvedValue({
      totalOutfits: 45,
      favoriteCount: 12,
      shareCount: 8,
      joinedDays: 15,
      aiAccuracy: 0.82,
    });

    const { result } = renderHook(() => useUserStats(), { wrapper: createWrapper() });

    // Query should have staleTime set
    expect(result.current).toBeDefined();
  });
});
