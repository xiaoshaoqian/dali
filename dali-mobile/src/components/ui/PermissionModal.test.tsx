/**
 * PermissionModal Component Tests
 * Tests for the permission request modal
 *
 * @see Story 8.1: Permission Manager with Friendly Prompts
 * @see AC#2, #4, #6, #9: Permission Pre-Dialogs
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useSharedValue: jest.fn((initial) => ({ value: initial })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
  };
});

import { PermissionModal } from './PermissionModal';

describe('PermissionModal', () => {
  const defaultProps = {
    visible: true,
    icon: 'camera' as const,
    title: '需要访问相机',
    description: '搭理需要使用相机拍摄你的衣服照片，以便 AI 为你生成搭配建议。',
    primaryButtonLabel: '好的，允许',
    secondaryButtonLabel: '暂不',
    onPrimaryPress: jest.fn(),
    onSecondaryPress: jest.fn(),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when visible is true', () => {
      render(<PermissionModal {...defaultProps} />);

      expect(screen.getByText('需要访问相机')).toBeTruthy();
      expect(screen.getByText(defaultProps.description)).toBeTruthy();
    });

    it('should not render modal when visible is false', () => {
      render(<PermissionModal {...defaultProps} visible={false} />);

      expect(screen.queryByText('需要访问相机')).toBeNull();
    });

    it('should render title correctly', () => {
      render(<PermissionModal {...defaultProps} title="测试标题" />);

      expect(screen.getByText('测试标题')).toBeTruthy();
    });

    it('should render description correctly', () => {
      render(<PermissionModal {...defaultProps} description="测试描述" />);

      expect(screen.getByText('测试描述')).toBeTruthy();
    });

    it('should render primary button with correct label', () => {
      render(<PermissionModal {...defaultProps} primaryButtonLabel="确认" />);

      expect(screen.getByText('确认')).toBeTruthy();
    });

    it('should render secondary button with correct label', () => {
      render(<PermissionModal {...defaultProps} secondaryButtonLabel="取消" />);

      expect(screen.getByText('取消')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPrimaryPress when primary button is pressed', () => {
      const onPrimaryPress = jest.fn();
      render(<PermissionModal {...defaultProps} onPrimaryPress={onPrimaryPress} />);

      fireEvent.press(screen.getByTestId('permission-modal-primary-button'));

      expect(onPrimaryPress).toHaveBeenCalledTimes(1);
    });

    it('should call onSecondaryPress when secondary button is pressed', () => {
      const onSecondaryPress = jest.fn();
      render(<PermissionModal {...defaultProps} onSecondaryPress={onSecondaryPress} />);

      fireEvent.press(screen.getByTestId('permission-modal-secondary-button'));

      expect(onSecondaryPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('different permission types', () => {
    it('should render camera permission modal', () => {
      render(
        <PermissionModal
          {...defaultProps}
          icon="camera"
          title="需要访问相机"
        />
      );

      expect(screen.getByText('需要访问相机')).toBeTruthy();
    });

    it('should render photo library permission modal', () => {
      render(
        <PermissionModal
          {...defaultProps}
          icon="images"
          title="需要访问相册"
          description="搭理需要访问相册以选择你的衣服照片。"
        />
      );

      expect(screen.getByText('需要访问相册')).toBeTruthy();
    });

    it('should render location permission modal', () => {
      render(
        <PermissionModal
          {...defaultProps}
          icon="location"
          title="想获取当地天气吗？（可选）"
          description="我们会根据天气为你推荐更合适的搭配，只获取城市级别位置。"
          primaryButtonLabel="允许"
          secondaryButtonLabel="暂不需要"
        />
      );

      expect(screen.getByText('想获取当地天气吗？（可选）')).toBeTruthy();
      expect(screen.getByText('允许')).toBeTruthy();
      expect(screen.getByText('暂不需要')).toBeTruthy();
    });

    it('should render notification permission modal', () => {
      render(
        <PermissionModal
          {...defaultProps}
          icon="notifications"
          title="想第一时间收到搭配建议吗？"
          description="当 AI 完成分析后，我们会通知你，不会发送营销信息。"
          primaryButtonLabel="开启通知"
          secondaryButtonLabel="暂不"
        />
      );

      expect(screen.getByText('想第一时间收到搭配建议吗？')).toBeTruthy();
      expect(screen.getByText('开启通知')).toBeTruthy();
    });
  });
});
