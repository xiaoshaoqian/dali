/**
 * SyncStatusSection Component Tests
 *
 * @see Story 8.3: AC#12 - Settings page sync status
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { SyncStatusSection } from './SyncStatusSection';

// =============================================================================
// Mocks
// =============================================================================

const mockUseSyncStatus = {
  isSyncing: false,
  lastSyncTime: Date.now() - 60000,
  lastSyncTimeFormatted: '1 分钟前',
  pendingSyncCount: 0,
};

const mockUseNetworkStatus = {
  isOnline: true,
  wasOnline: true,
};

jest.mock('@/hooks', () => ({
  useSyncStatus: () => mockUseSyncStatus,
  useNetworkStatus: () => mockUseNetworkStatus,
}));

// =============================================================================
// Tests
// =============================================================================

describe('SyncStatusSection', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseSyncStatus.isSyncing = false;
    mockUseSyncStatus.pendingSyncCount = 0;
    mockUseSyncStatus.lastSyncTimeFormatted = '1 分钟前';
    mockUseNetworkStatus.isOnline = true;
  });

  describe('render', () => {
    it('should render the component', () => {
      const { getByText } = render(<SyncStatusSection />);

      expect(getByText('云同步')).toBeTruthy();
    });

    it('should show "已同步" when online and no pending items', () => {
      const { getByText } = render(<SyncStatusSection />);

      expect(getByText('已同步')).toBeTruthy();
      expect(getByText('上次同步: 1 分钟前')).toBeTruthy();
    });

    it('should show sync button by default', () => {
      const { getByLabelText } = render(<SyncStatusSection />);

      expect(getByLabelText('手动同步')).toBeTruthy();
    });

    it('should hide sync button when showSyncButton is false', () => {
      const { queryByLabelText } = render(<SyncStatusSection showSyncButton={false} />);

      expect(queryByLabelText('手动同步')).toBeNull();
    });
  });

  describe('syncing state', () => {
    it('should show "正在同步..." when syncing', () => {
      mockUseSyncStatus.isSyncing = true;

      const { getByText } = render(<SyncStatusSection />);

      expect(getByText('正在同步...')).toBeTruthy();
    });

    it('should hide sync button when syncing', () => {
      mockUseSyncStatus.isSyncing = true;

      const { queryByLabelText } = render(<SyncStatusSection />);

      expect(queryByLabelText('手动同步')).toBeNull();
    });
  });

  describe('pending items', () => {
    it('should show pending count when there are pending items', () => {
      mockUseSyncStatus.pendingSyncCount = 5;

      const { getByText } = render(<SyncStatusSection />);

      expect(getByText('5 项待同步')).toBeTruthy();
    });

    it('should show pending info message when there are pending items', () => {
      mockUseSyncStatus.pendingSyncCount = 3;

      const { getByText } = render(<SyncStatusSection />);

      expect(getByText(/有 3 项数据等待同步/)).toBeTruthy();
    });
  });

  describe('offline state', () => {
    it('should show "离线模式" when offline', () => {
      mockUseNetworkStatus.isOnline = false;

      const { getByText } = render(<SyncStatusSection />);

      expect(getByText('离线模式')).toBeTruthy();
    });

    it('should show offline info message when offline', () => {
      mockUseNetworkStatus.isOnline = false;

      const { getByText } = render(<SyncStatusSection />);

      expect(getByText(/离线模式下所做的更改将在网络恢复后自动同步/)).toBeTruthy();
    });

    it('should hide sync button when offline', () => {
      mockUseNetworkStatus.isOnline = false;

      const { queryByLabelText } = render(<SyncStatusSection />);

      expect(queryByLabelText('手动同步')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onSyncPress when sync button is pressed', () => {
      const mockOnSyncPress = jest.fn();

      const { getByLabelText } = render(<SyncStatusSection onSyncPress={mockOnSyncPress} />);

      fireEvent.press(getByLabelText('手动同步'));

      expect(mockOnSyncPress).toHaveBeenCalledTimes(1);
    });
  });
});
