/**
 * useUserProfile Hook Tests
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useUserProfile, useUpdateUserProfile, useUploadAvatar } from '../useUserProfile';
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

describe('useUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user profile successfully', async () => {
    const mockProfile = {
      id: 'user-123',
      nickname: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-09T00:00:00Z',
    };

    mockUserService.getUserProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
  });

  it('should handle error when fetching profile', async () => {
    mockUserService.getUserProfile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useUpdateUserProfile', () => {
  it('should update user profile successfully', async () => {
    const updatedProfile = {
      id: 'user-123',
      nickname: 'NewName',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-09T00:00:00Z',
    };

    mockUserService.updateUserProfile.mockResolvedValue(updatedProfile);

    const { result } = renderHook(() => useUpdateUserProfile(), { wrapper: createWrapper() });

    result.current.mutate({ nickname: 'NewName' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(updatedProfile);
  });
});

describe('useUploadAvatar', () => {
  it('should upload avatar successfully', async () => {
    const mockAvatarUrl = 'https://oss.example.com/avatars/user-123.jpg';

    mockUserService.uploadUserAvatar.mockResolvedValue(mockAvatarUrl);

    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() });

    result.current.mutate('file:///local/image.jpg');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(mockAvatarUrl);
  });
});
