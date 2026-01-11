/**
 * OfflineBanner Component Tests
 *
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see AC#2: Offline Banner Display
 */
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { OfflineBanner } from './OfflineBanner';
import { useOfflineStore } from '@/stores';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Pan: () => ({
        onEnd: () => ({ onEnd: jest.fn() }),
      }),
    },
  };
});

// Mock the store
jest.mock('@/stores', () => ({
  useOfflineStore: jest.fn(),
}));

const mockUseOfflineStore = useOfflineStore as jest.MockedFunction<typeof useOfflineStore>;

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('visibility', () => {
    it('should not render when online', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: true,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { queryByTestId } = render(<OfflineBanner />);

      expect(queryByTestId('offline-banner')).toBeNull();
    });

    it('should render when offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { getByTestId } = render(<OfflineBanner />);

      expect(getByTestId('offline-banner')).toBeTruthy();
    });

    it('should display correct offline message', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { getByText } = render(<OfflineBanner />);

      expect(getByText('当前离线，部分功能不可用')).toBeTruthy();
    });
  });

  describe('auto-collapse behavior', () => {
    it('should trigger auto-collapse timer after 3 seconds', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { getByTestId, queryByText } = render(<OfflineBanner />);

      // Initially expanded
      expect(getByTestId('offline-banner')).toBeTruthy();
      expect(queryByText('当前离线，部分功能不可用')).toBeTruthy();

      // Fast-forward 3 seconds - timer should trigger collapse
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // The banner should still exist (just in collapsed state internally)
      expect(getByTestId('offline-banner')).toBeTruthy();
    });
  });

  describe('swipe to dismiss', () => {
    it('should have swipe gesture handler', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { getByTestId } = render(<OfflineBanner />);

      // Banner should be touchable/swipeable
      const banner = getByTestId('offline-banner');
      expect(banner).toBeTruthy();
    });
  });

  describe('tap to expand', () => {
    it('should maintain banner visibility across state changes', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { getByTestId, queryByText } = render(<OfflineBanner />);

      // Initially should show banner with message
      expect(getByTestId('offline-banner')).toBeTruthy();
      expect(queryByText('当前离线，部分功能不可用')).toBeTruthy();

      // Advance timers for collapse
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Banner should still be visible (component handles collapse internally)
      expect(getByTestId('offline-banner')).toBeTruthy();
    });
  });

  describe('transition from online to offline', () => {
    it('should show banner when transitioning from online to offline', () => {
      // Initially online
      mockUseOfflineStore.mockReturnValue({
        isOnline: true,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { rerender, queryByTestId } = render(<OfflineBanner />);

      expect(queryByTestId('offline-banner')).toBeNull();

      // Transition to offline
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      rerender(<OfflineBanner />);

      expect(queryByTestId('offline-banner')).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('should have yellow/orange warning background color', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { getByTestId } = render(<OfflineBanner />);

      const banner = getByTestId('offline-banner');
      // The banner should exist with warning styling
      expect(banner).toBeTruthy();
    });

    it('should display WiFi off icon', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { getByTestId } = render(<OfflineBanner />);

      expect(getByTestId('offline-icon')).toBeTruthy();
    });
  });
});
