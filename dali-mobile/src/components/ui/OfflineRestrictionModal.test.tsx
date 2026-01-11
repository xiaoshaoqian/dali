/**
 * OfflineRestrictionModal Component Tests
 *
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see AC#4: Offline Generate Restriction
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OfflineRestrictionModal } from './OfflineRestrictionModal';

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('OfflineRestrictionModal', () => {
  const defaultProps = {
    visible: true,
    title: '当前离线',
    message: '无法生成新搭配，你可以查看历史搭配或等待网络恢复',
    primaryButtonLabel: '查看历史',
    secondaryButtonLabel: '知道了',
    onPrimaryPress: jest.fn(),
    onSecondaryPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('should render when visible is true', () => {
      const { getByTestId } = render(
        <OfflineRestrictionModal {...defaultProps} />
      );

      expect(getByTestId('offline-restriction-modal')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByTestId } = render(
        <OfflineRestrictionModal {...defaultProps} visible={false} />
      );

      expect(queryByTestId('offline-restriction-modal')).toBeNull();
    });
  });

  describe('content', () => {
    it('should display the title', () => {
      const { getByText } = render(
        <OfflineRestrictionModal {...defaultProps} />
      );

      expect(getByText('当前离线')).toBeTruthy();
    });

    it('should display the message', () => {
      const { getByText } = render(
        <OfflineRestrictionModal {...defaultProps} />
      );

      expect(getByText('无法生成新搭配，你可以查看历史搭配或等待网络恢复')).toBeTruthy();
    });

    it('should display the offline icon', () => {
      const { getByTestId } = render(
        <OfflineRestrictionModal {...defaultProps} />
      );

      expect(getByTestId('offline-restriction-icon')).toBeTruthy();
    });
  });

  describe('buttons', () => {
    it('should display primary button with correct label', () => {
      const { getByText } = render(
        <OfflineRestrictionModal {...defaultProps} />
      );

      expect(getByText('查看历史')).toBeTruthy();
    });

    it('should display secondary button with correct label', () => {
      const { getByText } = render(
        <OfflineRestrictionModal {...defaultProps} />
      );

      expect(getByText('知道了')).toBeTruthy();
    });

    it('should call onPrimaryPress when primary button is pressed', () => {
      const onPrimaryPress = jest.fn();
      const { getByTestId } = render(
        <OfflineRestrictionModal {...defaultProps} onPrimaryPress={onPrimaryPress} />
      );

      fireEvent.press(getByTestId('offline-modal-primary-button'));

      expect(onPrimaryPress).toHaveBeenCalledTimes(1);
    });

    it('should call onSecondaryPress when secondary button is pressed', () => {
      const onSecondaryPress = jest.fn();
      const { getByTestId } = render(
        <OfflineRestrictionModal {...defaultProps} onSecondaryPress={onSecondaryPress} />
      );

      fireEvent.press(getByTestId('offline-modal-secondary-button'));

      expect(onSecondaryPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('dismiss', () => {
    it('should call onDismiss when backdrop is pressed', () => {
      const onDismiss = jest.fn();
      const { getByTestId } = render(
        <OfflineRestrictionModal {...defaultProps} onDismiss={onDismiss} />
      );

      fireEvent.press(getByTestId('offline-modal-backdrop'));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
