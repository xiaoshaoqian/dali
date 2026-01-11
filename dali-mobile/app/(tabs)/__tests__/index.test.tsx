/**
 * Home Screen Tests - Offline Mode
 *
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see AC#4: Offline Generate Restriction
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock useOfflineMode hook
const mockUseOfflineMode = jest.fn();
jest.mock('@/hooks', () => ({
  useOfflineMode: () => mockUseOfflineMode(),
}));

// Mock UI components
jest.mock('@/components/ui', () => ({
  OfflineRestrictionModal: ({
    visible,
    onPrimaryPress,
    onSecondaryPress,
  }: {
    visible: boolean;
    onPrimaryPress: () => void;
    onSecondaryPress: () => void;
  }) =>
    visible ? (
      <mock-modal testID="offline-modal">
        <mock-button testID="modal-primary" onPress={onPrimaryPress} />
        <mock-button testID="modal-secondary" onPress={onSecondaryPress} />
      </mock-modal>
    ) : null,
}));

// Mock icon components
jest.mock('@/components/ui/icons', () => ({
  CameraIcon: () => null,
  AlbumIcon: () => null,
  OutfitIcon: () => null,
}));

import HomeScreen from '../index';

describe('HomeScreen Offline Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when online', () => {
    beforeEach(() => {
      mockUseOfflineMode.mockReturnValue({
        isOffline: false,
        canPerformAction: () => true,
        getRestrictionMessage: () => null,
      });
    });

    it('should enable camera button', () => {
      const { getByText } = render(<HomeScreen />);
      const cameraButton = getByText('拍照').parent?.parent;

      fireEvent.press(cameraButton!);

      expect(mockPush).toHaveBeenCalledWith('/camera');
    });

    it('should enable album button', () => {
      const { getByText } = render(<HomeScreen />);
      const albumButton = getByText('从相册选择').parent?.parent;

      fireEvent.press(albumButton!);

      expect(mockPush).toHaveBeenCalledWith('/album');
    });

    it('should not show offline modal', () => {
      const { queryByTestId } = render(<HomeScreen />);

      expect(queryByTestId('offline-modal')).toBeNull();
    });
  });

  describe('when offline', () => {
    beforeEach(() => {
      mockUseOfflineMode.mockReturnValue({
        isOffline: true,
        canPerformAction: (action: string) => action !== 'generate_outfit',
        getRestrictionMessage: () => '无法生成新搭配，你可以查看历史搭配或等待网络恢复',
      });
    });

    it('should show offline modal when camera button tapped', () => {
      const { getByText, getByTestId } = render(<HomeScreen />);
      const cameraButton = getByText('拍照').parent?.parent;

      fireEvent.press(cameraButton!);

      expect(getByTestId('offline-modal')).toBeTruthy();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show offline modal when album button tapped', () => {
      const { getByText, getByTestId } = render(<HomeScreen />);
      const albumButton = getByText('从相册选择').parent?.parent;

      fireEvent.press(albumButton!);

      expect(getByTestId('offline-modal')).toBeTruthy();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should navigate to wardrobe when primary button pressed', () => {
      const { getByText, getByTestId } = render(<HomeScreen />);
      const cameraButton = getByText('拍照').parent?.parent;

      // Open modal
      fireEvent.press(cameraButton!);

      // Press "查看历史" button
      fireEvent.press(getByTestId('modal-primary'));

      expect(mockPush).toHaveBeenCalledWith('/(tabs)/wardrobe');
    });

    it('should dismiss modal when secondary button pressed', () => {
      const { getByText, getByTestId, queryByTestId } = render(<HomeScreen />);
      const cameraButton = getByText('拍照').parent?.parent;

      // Open modal
      fireEvent.press(cameraButton!);
      expect(getByTestId('offline-modal')).toBeTruthy();

      // Press "知道了" button
      fireEvent.press(getByTestId('modal-secondary'));

      expect(queryByTestId('offline-modal')).toBeNull();
    });
  });
});
