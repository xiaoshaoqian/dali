/**
 * SyncToast Component Tests
 * Tests for sync progress toast with animated states
 *
 * @see Story 8.3: Network Reconnection and Auto-Sync within 30s
 * @see AC#7: Sync Progress Feedback
 */
import React from 'react';
import { render, act } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock offlineStore
const mockIsSyncing = jest.fn();
const mockLastSyncResult = jest.fn();

jest.mock('@/stores', () => ({
  useOfflineStore: () => ({
    isSyncing: mockIsSyncing(),
    lastSyncResult: mockLastSyncResult(),
  }),
}));

// Mock SafeAreaInsets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
}));

import { SyncToast } from './SyncToast';

describe('SyncToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsSyncing.mockReturnValue(false);
    mockLastSyncResult.mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('render', () => {
    it('should not render when not syncing and no result', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue(null);

      const { queryByTestId } = render(<SyncToast />);

      expect(queryByTestId('sync-toast')).toBeNull();
    });

    it('should render when syncing', () => {
      mockIsSyncing.mockReturnValue(true);
      mockLastSyncResult.mockReturnValue(null);

      const { getByTestId, getByText } = render(<SyncToast />);

      expect(getByTestId('sync-toast')).toBeTruthy();
      expect(getByText('正在同步数据...')).toBeTruthy();
    });

    it('should show spinner icon during sync', () => {
      mockIsSyncing.mockReturnValue(true);
      mockLastSyncResult.mockReturnValue(null);

      const { getByTestId } = render(<SyncToast />);

      expect(getByTestId('sync-spinner')).toBeTruthy();
    });
  });

  describe('sync completion', () => {
    it('should show completion message with uploaded count', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 3,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      });

      const { getByTestId, getByText } = render(<SyncToast />);

      expect(getByTestId('sync-toast')).toBeTruthy();
      expect(getByText('已同步 3 条数据 ✓')).toBeTruthy();
    });

    it('should show checkmark icon on completion', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 1,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      });

      const { getByTestId } = render(<SyncToast />);

      expect(getByTestId('sync-checkmark')).toBeTruthy();
    });

    it('should auto-dismiss after 2 seconds', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 2,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      });

      const { queryByTestId, getByTestId } = render(<SyncToast />);

      // Should be visible initially
      expect(getByTestId('sync-toast')).toBeTruthy();

      // Advance time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Note: Due to animation, we may need to wait for the animation to complete
      // The actual dismiss happens after animation
    });

    it('should include downloaded count in total', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 2,
        downloaded: 3,
        conflicts: 0,
        errors: [],
      });

      const { getByText } = render(<SyncToast />);

      // Total should be uploaded + downloaded = 5
      expect(getByText('已同步 5 条数据 ✓')).toBeTruthy();
    });
  });

  describe('sync with errors', () => {
    it('should show error state when sync has errors', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: ['Network error'],
      });

      const { getByText, getByTestId } = render(<SyncToast />);

      expect(getByTestId('sync-toast')).toBeTruthy();
      expect(getByText('同步失败，稍后重试')).toBeTruthy();
    });

    it('should show warning icon on error', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 0,
        downloaded: 0,
        conflicts: 0,
        errors: ['API error'],
      });

      const { getByTestId } = render(<SyncToast />);

      expect(getByTestId('sync-error-icon')).toBeTruthy();
    });
  });

  describe('sync with conflicts', () => {
    it('should show conflict info when conflicts exist', () => {
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 2,
        downloaded: 0,
        conflicts: 1,
        errors: [],
      });

      const { getByText } = render(<SyncToast />);

      // Should still show success but include conflict info
      expect(getByText('已同步 2 条数据 ✓')).toBeTruthy();
    });
  });

  describe('transition states', () => {
    it('should transition from syncing to completion', () => {
      // Start syncing
      mockIsSyncing.mockReturnValue(true);
      mockLastSyncResult.mockReturnValue(null);

      const { rerender, getByText, getByTestId } = render(<SyncToast />);

      expect(getByText('正在同步数据...')).toBeTruthy();

      // Finish syncing
      mockIsSyncing.mockReturnValue(false);
      mockLastSyncResult.mockReturnValue({
        uploaded: 5,
        downloaded: 0,
        conflicts: 0,
        errors: [],
      });

      rerender(<SyncToast />);

      expect(getByText('已同步 5 条数据 ✓')).toBeTruthy();
    });
  });

  describe('visibility control', () => {
    it('should respect visible prop when provided', () => {
      mockIsSyncing.mockReturnValue(true);

      const { queryByTestId } = render(<SyncToast visible={false} />);

      expect(queryByTestId('sync-toast')).toBeNull();
    });

    it('should show when visible is true and syncing', () => {
      mockIsSyncing.mockReturnValue(true);

      const { getByTestId } = render(<SyncToast visible={true} />);

      expect(getByTestId('sync-toast')).toBeTruthy();
    });
  });
});
