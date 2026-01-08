/**
 * ShareImagePreview Component Tests
 *
 * @module components/share/ShareImagePreview.test
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ShareImagePreview } from './ShareImagePreview';
import { saveImageToGallery, trackSaveToGallery } from '@/services/share';

// Mock dependencies
jest.mock('@/services/share');
jest.mock('expo-haptics');
jest.mock('expo-blur', () => ({
  BlurView: ({ children, style }: { children: React.ReactNode; style?: object }) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: object }) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Svg: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Path: () => null,
    Line: () => null,
    Circle: () => null,
    Rect: () => null,
  };
});

// Mock StatusBar to avoid issues in tests
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
  setTranslucent: jest.fn(),
  pushStackEntry: jest.fn(),
  popStackEntry: jest.fn(),
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => children || null,
}));

const mockSaveImageToGallery = saveImageToGallery as jest.MockedFunction<typeof saveImageToGallery>;
const mockTrackSaveToGallery = trackSaveToGallery as jest.MockedFunction<typeof trackSaveToGallery>;
const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

describe('ShareImagePreview', () => {
  const defaultProps = {
    imageUri: 'file:///test/image.png',
    templateStyle: 'minimal' as const,
    outfitId: 'outfit-123',
    onRegenerate: jest.fn(),
    onShare: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHaptics.impactAsync.mockResolvedValue();
    mockHaptics.notificationAsync.mockResolvedValue();
  });

  describe('rendering', () => {
    it('should render preview image', () => {
      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      expect(getByTestId('preview-image')).toBeTruthy();
    });

    it('should render all action buttons', () => {
      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      expect(getByTestId('save-button')).toBeTruthy();
      expect(getByTestId('share-button')).toBeTruthy();
      expect(getByTestId('regenerate-button')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      expect(getByTestId('close-button')).toBeTruthy();
    });

    it('should render action button labels', () => {
      const { getByText } = render(<ShareImagePreview {...defaultProps} />);

      expect(getByText('保存到相册')).toBeTruthy();
      expect(getByText('分享到...')).toBeTruthy();
      expect(getByText('重新生成')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button is pressed', async () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <ShareImagePreview {...defaultProps} onClose={onClose} />
      );

      fireEvent.press(getByTestId('close-button'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onShare when share button is pressed', async () => {
      const onShare = jest.fn();
      const { getByTestId } = render(
        <ShareImagePreview {...defaultProps} onShare={onShare} />
      );

      fireEvent.press(getByTestId('share-button'));

      await waitFor(() => {
        expect(onShare).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onRegenerate when regenerate button is pressed', async () => {
      const onRegenerate = jest.fn();
      const { getByTestId } = render(
        <ShareImagePreview {...defaultProps} onRegenerate={onRegenerate} />
      );

      fireEvent.press(getByTestId('regenerate-button'));

      await waitFor(() => {
        expect(onRegenerate).toHaveBeenCalledTimes(1);
      });
    });

    it('should trigger haptic feedback on share button press', async () => {
      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      fireEvent.press(getByTestId('share-button'));

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });
    });

    it('should trigger haptic feedback on regenerate button press', async () => {
      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      fireEvent.press(getByTestId('regenerate-button'));

      await waitFor(() => {
        expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });
    });
  });

  describe('save to gallery', () => {
    it('should save image and show success toast when save succeeds', async () => {
      mockSaveImageToGallery.mockResolvedValue({
        success: true,
      });
      mockTrackSaveToGallery.mockResolvedValue();

      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockSaveImageToGallery).toHaveBeenCalledWith('file:///test/image.png');
        expect(mockTrackSaveToGallery).toHaveBeenCalledWith('outfit-123', 'minimal');
      });
    });

    it('should show alert when permission is denied', async () => {
      mockSaveImageToGallery.mockResolvedValue({
        success: false,
        error: 'permission_denied',
      });
      const alertSpy = jest.spyOn(Alert, 'alert');

      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          '权限不足',
          '需要相册权限才能保存，请前往设置开启',
          expect.any(Array)
        );
      });
    });

    it('should show alert when file is not found', async () => {
      mockSaveImageToGallery.mockResolvedValue({
        success: false,
        error: 'file_not_found',
      });
      const alertSpy = jest.spyOn(Alert, 'alert');

      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          '保存失败',
          '图片文件不存在，请重新生成'
        );
      });
    });

    it('should show alert when save fails', async () => {
      mockSaveImageToGallery.mockResolvedValue({
        success: false,
        error: 'save_failed',
      });
      const alertSpy = jest.spyOn(Alert, 'alert');

      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          '保存失败',
          '保存图片时出错，请重试'
        );
      });
    });

    it('should show loading indicator while saving', async () => {
      // Create a never-resolving promise to keep loading state
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockSaveImageToGallery.mockReturnValue(pendingPromise as any);

      const { getByTestId, queryByTestId } = render(
        <ShareImagePreview {...defaultProps} />
      );

      fireEvent.press(getByTestId('save-button'));

      // Should show loading indicator
      await waitFor(() => {
        // Button should be disabled during save
        expect(getByTestId('save-button').props.accessibilityState?.disabled).toBe(true);
      });

      // Clean up
      resolvePromise!({ success: true });
    });
  });

  describe('accessibility', () => {
    it('should have accessible buttons', () => {
      const { getByTestId } = render(<ShareImagePreview {...defaultProps} />);

      const saveButton = getByTestId('save-button');
      const shareButton = getByTestId('share-button');
      const regenerateButton = getByTestId('regenerate-button');

      expect(saveButton).toBeTruthy();
      expect(shareButton).toBeTruthy();
      expect(regenerateButton).toBeTruthy();
    });
  });
});
