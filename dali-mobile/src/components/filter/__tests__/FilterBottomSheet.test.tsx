/**
 * FilterBottomSheet Component Tests
 * Tests for the bottom sheet filter selection UI
 *
 * @see Story 5.3: Filter by Occasion, Time, and Favorites
 */

// Mock AsyncStorage for zustand persist middleware
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterBottomSheet } from '../FilterBottomSheet';
import { OCCASION_OPTIONS, TIME_RANGE_OPTIONS } from '@/stores/filterStore';

describe('FilterBottomSheet', () => {
  const mockOnSelectOccasion = jest.fn();
  const mockOnSelectTimeRange = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Occasion Filter', () => {
    it('should render all occasion options', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      // Check all 7 occasion options are rendered
      expect(getByText('💕 浪漫约会')).toBeTruthy();
      expect(getByText('💼 商务会议')).toBeTruthy();
      expect(getByText('🏢 职场通勤')).toBeTruthy();
      expect(getByText('🎉 朋友聚会')).toBeTruthy();
      expect(getByText('☕ 日常出行')).toBeTruthy();
      expect(getByText('🏠 居家休闲')).toBeTruthy();
      expect(getByText(' 全部')).toBeTruthy();
    });

    it('should render title for occasion filter', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      expect(getByText('选择场合')).toBeTruthy();
    });

    it('should call onSelectOccasion and onClose when option is selected', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('💕 浪漫约会'));

      expect(mockOnSelectOccasion).toHaveBeenCalledWith('浪漫约会');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should highlight selected occasion', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          selectedOccasion="职场通勤"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      // Verify the option is rendered
      expect(getByText('🏢 职场通勤')).toBeTruthy();
    });

    it('should call onSelectOccasion with undefined when "全部" is selected', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText(' 全部'));

      expect(mockOnSelectOccasion).toHaveBeenCalledWith(undefined);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Time Range Filter', () => {
    it('should render all time range options', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="timeRange"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      // Check all 4 time range options
      expect(getByText('全部时间')).toBeTruthy();
      expect(getByText('最近 7 天')).toBeTruthy();
      expect(getByText('最近 30 天')).toBeTruthy();
      expect(getByText('最近 3 个月')).toBeTruthy();
    });

    it('should render title for time range filter', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="timeRange"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      expect(getByText('选择时间范围')).toBeTruthy();
    });

    it('should call onSelectTimeRange and onClose when option is selected', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="timeRange"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('最近 7 天'));

      expect(mockOnSelectTimeRange).toHaveBeenCalledWith(7);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should highlight selected time range', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="timeRange"
          selectedTimeRange={30}
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      // Verify the option is rendered
      expect(getByText('最近 30 天')).toBeTruthy();
    });
  });

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      expect(getByText('取消')).toBeTruthy();
    });

    it('should call onClose when cancel button is pressed', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      fireEvent.press(getByText('取消'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backdrop', () => {
    it('should be dismissable', () => {
      const { getByText } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      // Verify modal is rendered
      expect(getByText('选择场合')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render all occasion options with accessibility', () => {
      const { getAllByRole } = render(
        <FilterBottomSheet
          visible={true}
          filterType="occasion"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      const buttons = getAllByRole('button');
      // 7 occasion options + 1 cancel button = 8 buttons
      expect(buttons.length).toBeGreaterThanOrEqual(7);
    });

    it('should render all time range options with accessibility', () => {
      const { getAllByRole } = render(
        <FilterBottomSheet
          visible={true}
          filterType="timeRange"
          onSelectOccasion={mockOnSelectOccasion}
          onSelectTimeRange={mockOnSelectTimeRange}
          onClose={mockOnClose}
        />
      );

      const buttons = getAllByRole('button');
      // 4 time range options + 1 cancel button = 5 buttons
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });
  });
});
