/**
 * SharePlatformSheet Component Tests
 *
 * Tests for the social platform selection action sheet component.
 *
 * @module components/share/SharePlatformSheet.test
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ActionSheetIOS } from 'react-native';

import { SharePlatformSheet } from './SharePlatformSheet';
import * as shareService from '@/services/share';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

// Mock share service functions
jest.mock('@/services/share', () => ({
  shareToSystem: jest.fn(),
  checkWeChatInstalled: jest.fn(),
  openWeChatAppStore: jest.fn(),
  trackShareToPlatform: jest.fn(),
}));

// Mock ActionSheetIOS
const mockShowActionSheetWithOptions = jest.fn();
jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(mockShowActionSheetWithOptions);

describe('SharePlatformSheet', () => {
  const mockProps = {
    imageUri: 'file:///test/image.png',
    outfitId: 'outfit-123',
    templateStyle: 'minimal' as const,
    onComplete: jest.fn(),
    onCancel: jest.fn(),
    visible: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (shareService.shareToSystem as jest.Mock).mockResolvedValue({ success: true, dismissed: false });
    (shareService.checkWeChatInstalled as jest.Mock).mockResolvedValue(false);
    (shareService.trackShareToPlatform as jest.Mock).mockResolvedValue(undefined);
  });

  describe('visibility', () => {
    it('should not show ActionSheet when visible is false', () => {
      render(<SharePlatformSheet {...mockProps} visible={false} />);

      expect(mockShowActionSheetWithOptions).not.toHaveBeenCalled();
    });

    it('should show ActionSheet when visible is true on iOS', async () => {
      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(mockShowActionSheetWithOptions).toHaveBeenCalled();
      });
    });

    it('should call showActionSheetWithOptions with correct options', async () => {
      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(mockShowActionSheetWithOptions).toHaveBeenCalledWith(
          {
            options: ['取消', '微信好友', '微信朋友圈', '更多...'],
            cancelButtonIndex: 0,
          },
          expect.any(Function)
        );
      });
    });
  });

  describe('cancel action', () => {
    it('should call onCancel when cancel button is pressed', async () => {
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(0); // Cancel button index
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(mockProps.onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('system share (更多...)', () => {
    it('should trigger system share when "更多..." is selected', async () => {
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(3); // More button index
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(shareService.shareToSystem).toHaveBeenCalledWith('file:///test/image.png');
      });
    });

    it('should track system_share platform when successful', async () => {
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(3); // More button index
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(shareService.trackShareToPlatform).toHaveBeenCalledWith(
          'outfit-123',
          'minimal',
          'system_share'
        );
      });
    });

    it('should call onComplete after system share', async () => {
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(3);
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(mockProps.onComplete).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('WeChat share', () => {
    it('should check if WeChat is installed when 微信好友 is selected', async () => {
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(1); // WeChat session button index
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(shareService.checkWeChatInstalled).toHaveBeenCalled();
      });
    });

    it('should check if WeChat is installed when 微信朋友圈 is selected', async () => {
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(2); // WeChat timeline button index
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(shareService.checkWeChatInstalled).toHaveBeenCalled();
      });
    });

    it('should fallback to system share when WeChat is installed (MVP)', async () => {
      (shareService.checkWeChatInstalled as jest.Mock).mockResolvedValue(true);
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(1);
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(shareService.shareToSystem).toHaveBeenCalled();
      });
    });

    it('should track wechat_session when WeChat session is selected', async () => {
      (shareService.checkWeChatInstalled as jest.Mock).mockResolvedValue(true);
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(1);
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(shareService.trackShareToPlatform).toHaveBeenCalledWith(
          'outfit-123',
          'minimal',
          'wechat_session'
        );
      });
    });

    it('should track wechat_timeline when WeChat timeline is selected', async () => {
      (shareService.checkWeChatInstalled as jest.Mock).mockResolvedValue(true);
      mockShowActionSheetWithOptions.mockImplementation(
        (options, callback) => {
          callback(2);
        }
      );

      render(<SharePlatformSheet {...mockProps} visible={true} />);

      await waitFor(() => {
        expect(shareService.trackShareToPlatform).toHaveBeenCalledWith(
          'outfit-123',
          'minimal',
          'wechat_timeline'
        );
      });
    });
  });

  describe('component rendering', () => {
    it('should return null (ActionSheet is imperative)', () => {
      const { toJSON } = render(<SharePlatformSheet {...mockProps} visible={false} />);
      expect(toJSON()).toBeNull();
    });
  });
});
