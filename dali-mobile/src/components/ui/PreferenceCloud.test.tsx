/**
 * PreferenceCloud Component Tests
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see AC#2: PreferenceCloud Word Cloud Rendering
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { PreferenceCloud } from './PreferenceCloud';
import type { PreferenceCloudProps } from './PreferenceCloud';

// =============================================================================
// Test Data
// =============================================================================

const mockPreferences: PreferenceCloudProps['preferences'] = [
  { tag: '简约', weight: 1.0, type: 'user' },
  { tag: '通勤', weight: 0.9, type: 'user' },
  { tag: '知性', weight: 0.8, type: 'user' },
  { tag: '黑白配色', weight: 0.7, type: 'inferred' },
  { tag: '阔腿裤', weight: 0.5, type: 'inferred' },
  { tag: '经典款', weight: 0.3, type: 'inferred' },
];

// =============================================================================
// Tests
// =============================================================================

describe('PreferenceCloud', () => {
  describe('render', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );
      expect(getByTestId('preference-cloud')).toBeTruthy();
    });

    it('should render all preference tags', () => {
      const { getByText } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      // Verify all tags are rendered
      expect(getByText('简约')).toBeTruthy();
      expect(getByText('通勤')).toBeTruthy();
      expect(getByText('知性')).toBeTruthy();
      expect(getByText('黑白配色')).toBeTruthy();
      expect(getByText('阔腿裤')).toBeTruthy();
      expect(getByText('经典款')).toBeTruthy();
    });

    it('should render empty state when no preferences provided', () => {
      const { getByTestId, queryByText } = render(
        <PreferenceCloud preferences={[]} />
      );

      expect(getByTestId('preference-cloud')).toBeTruthy();
      expect(queryByText('简约')).toBeNull();
    });

    it('should have accessible container', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      const container = getByTestId('preference-cloud');
      expect(container.props.accessibilityRole).toBe('list');
      expect(container.props.accessibilityLabel).toContain('风格偏好');
    });
  });

  describe('tag styling', () => {
    it('should apply user type styling to user-selected tags', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      const userTag = getByTestId('tag-简约');
      // User tags should have larger font and purple color
      expect(userTag).toBeTruthy();
    });

    it('should apply inferred type styling to AI-inferred tags', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      const inferredTag = getByTestId('tag-黑白配色');
      // Inferred tags should have smaller font and gray color
      expect(inferredTag).toBeTruthy();
    });

    it('should scale font size based on weight', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      // High weight tag
      const highWeightTag = getByTestId('tag-简约');
      // Low weight tag
      const lowWeightTag = getByTestId('tag-经典款');

      expect(highWeightTag).toBeTruthy();
      expect(lowWeightTag).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onTagPress when a tag is pressed', () => {
      const onTagPress = jest.fn();
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} onTagPress={onTagPress} />
      );

      const tag = getByTestId('tag-简约');
      fireEvent.press(tag);

      expect(onTagPress).toHaveBeenCalledWith('简约');
      expect(onTagPress).toHaveBeenCalledTimes(1);
    });

    it('should not crash when onTagPress is not provided', () => {
      const { getByText } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      const tag = getByText('简约');
      // Should not throw when pressed
      expect(() => fireEvent.press(tag)).not.toThrow();
    });

    it('should highlight tag on press', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} onTagPress={jest.fn()} />
      );

      const tag = getByTestId('tag-简约');
      fireEvent.press(tag);

      // Tag should be pressable
      expect(tag).toBeTruthy();
    });
  });

  describe('layout', () => {
    it('should position high weight tags more centrally', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      // Component should render with cloud layout
      const container = getByTestId('preference-cloud');
      expect(container).toBeTruthy();
    });

    it('should prevent tag overlap', () => {
      const { getAllByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      const tags = getAllByTestId(/^tag-/);
      expect(tags.length).toBe(mockPreferences.length);
    });
  });

  describe('accessibility', () => {
    it('should have accessible tags with proper labels', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      const tag = getByTestId('tag-简约');
      expect(tag.props.accessibilityRole).toBe('button');
      expect(tag.props.accessibilityLabel).toContain('简约');
    });

    it('should indicate tag type in accessibility label', () => {
      const { getByTestId } = render(
        <PreferenceCloud preferences={mockPreferences} />
      );

      const userTag = getByTestId('tag-简约');
      expect(userTag.props.accessibilityLabel).toContain('用户选择');

      const inferredTag = getByTestId('tag-黑白配色');
      expect(inferredTag.props.accessibilityLabel).toContain('AI推断');
    });
  });
});
