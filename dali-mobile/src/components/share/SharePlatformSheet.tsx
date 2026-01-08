/**
 * SharePlatformSheet Component
 *
 * Platform selection Action Sheet for sharing to social platforms.
 * Uses iOS native ActionSheetIOS on iOS, system share fallback on Android.
 * Provides options for WeChat Session, WeChat Timeline, and System Share.
 *
 * @module components/share/SharePlatformSheet
 */

import React, { useEffect, useCallback } from 'react';
import {
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  shareToSystem,
  checkWeChatInstalled,
  openWeChatAppStore,
  trackShareToPlatform,
} from '@/services/share';
import type { TemplateStyle, SharePlatform } from '@/types/share';

/**
 * SharePlatformSheet component props
 */
export interface SharePlatformSheetProps {
  /** URI of the image to share */
  imageUri: string;
  /** ID of the outfit being shared */
  outfitId: string;
  /** Template style used for the share image */
  templateStyle: TemplateStyle;
  /** Callback when share completes (success or failure) */
  onComplete: (success: boolean) => void;
  /** Callback when user cancels the share */
  onCancel: () => void;
  /** Whether to show the action sheet (controlled visibility) */
  visible: boolean;
}

/**
 * SharePlatformSheet component for social platform selection
 *
 * This component uses iOS native ActionSheetIOS for platform-native experience.
 * On Android, it falls back to system share directly.
 *
 * @param props - Component props
 * @returns null (ActionSheet is imperative API)
 */
export function SharePlatformSheet({
  imageUri,
  outfitId,
  templateStyle,
  onComplete,
  onCancel,
  visible,
}: SharePlatformSheetProps): React.ReactElement | null {
  /**
   * Handle WeChat share (session or timeline)
   */
  const handleWeChatShare = useCallback(async (scene: 'session' | 'timeline') => {
    // Check if WeChat is installed
    const isWeChatInstalled = await checkWeChatInstalled();

    if (!isWeChatInstalled) {
      Alert.alert(
        '微信未安装',
        '您还未安装微信，是否前往下载？',
        [
          { text: '取消', style: 'cancel', onPress: onCancel },
          {
            text: '前往下载',
            onPress: async () => {
              await openWeChatAppStore();
              onCancel();
            },
          },
        ]
      );
      return;
    }

    // MVP: WeChat SDK integration requires EAS Build / native module
    // For now, use system share as fallback but track with WeChat platform
    // TODO: Integrate react-native-wechat-lib when using EAS Build
    const result = await shareToSystem(imageUri);

    if (result.success) {
      // Track with WeChat platform info (not system_share)
      const platform: SharePlatform = scene === 'session' ? 'wechat_session' : 'wechat_timeline';
      await trackShareToPlatform(outfitId, templateStyle, platform);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    onComplete(result.success);
  }, [imageUri, outfitId, templateStyle, onCancel, onComplete]);

  /**
   * Handle system share (More... option)
   */
  const handleSystemShare = useCallback(async () => {
    const result = await shareToSystem(imageUri);

    if (result.success) {
      await trackShareToPlatform(outfitId, templateStyle, 'system_share');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    onComplete(result.success);
  }, [imageUri, outfitId, templateStyle, onComplete]);

  /**
   * Show iOS Action Sheet
   */
  const showActionSheet = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['取消', '微信好友', '微信朋友圈', '更多...'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          switch (buttonIndex) {
            case 1: // 微信好友
              await handleWeChatShare('session');
              break;
            case 2: // 微信朋友圈
              await handleWeChatShare('timeline');
              break;
            case 3: // 更多...
              await handleSystemShare();
              break;
            default: // 取消
              onCancel();
          }
        }
      );
    } else {
      // Android: Use system share directly
      await handleSystemShare();
    }
  }, [handleWeChatShare, handleSystemShare, onCancel]);

  /**
   * Show action sheet when visible becomes true
   */
  useEffect(() => {
    if (visible) {
      showActionSheet();
    }
  }, [visible, showActionSheet]);

  // ActionSheet is imperative API, no UI to render
  return null;
}

export default SharePlatformSheet;
