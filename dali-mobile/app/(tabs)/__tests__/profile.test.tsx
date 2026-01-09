/**
 * Profile Screen Tests
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ProfileScreen from '../profile';
import * as userHooks from '@/hooks/useUserProfile';
import * as statsHooks from '@/hooks/useUserStats';

// Mock hooks
jest.mock('@/hooks/useUserProfile');
jest.mock('@/hooks/useUserStats');
jest.mock('expo-haptics');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockProfile = {
  id: 'user-123',
  nickname: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-09T00:00:00Z',
};

const mockStats = {
  totalOutfits: 45,
  favoriteCount: 12,
  shareCount: 8,
  joinedDays: 15,
  aiAccuracy: 0.82,
};

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

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock hooks
    (userHooks.useUserProfile as jest.Mock).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      refetch: jest.fn(),
    });

    (userHooks.useUpdateUserProfile as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    (userHooks.useUploadAvatar as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    (statsHooks.useUserStats as jest.Mock).mockReturnValue({
      data: mockStats,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  it('should render profile screen with user info', async () => {
    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });
  });

  it('should render statistics correctly', async () => {
    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('45')).toBeTruthy(); // totalOutfits
      expect(screen.getByText('12')).toBeTruthy(); // favoriteCount
      expect(screen.getByText('8')).toBeTruthy(); // shareCount
    });
  });

  it('should render menu list', async () => {
    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('我的收藏')).toBeTruthy();
      expect(screen.getByText('分享记录')).toBeTruthy();
      expect(screen.getByText('风格档案')).toBeTruthy();
      expect(screen.getByText('设置')).toBeTruthy();
    });
  });

  it('should show loading state when profile is loading', () => {
    (userHooks.useUserProfile as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });

    const { queryByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(queryByText('Test User')).toBeNull();
  });

  it('should handle nickname modal open', async () => {
    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });

    // Click nickname to open modal
    const nickname = screen.getByText('Test User');
    fireEvent.press(nickname.parent);

    await waitFor(() => {
      expect(screen.getByText('修改昵称')).toBeTruthy();
    });
  });
});
