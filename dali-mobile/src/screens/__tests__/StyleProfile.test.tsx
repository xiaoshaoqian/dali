/**
 * Style Profile Screen Tests
 *
 * @see Story 7.3: PreferenceCloud Component and Edit Preferences
 * @see AC#1: Style Profile Page Entry
 * @see AC#6: Tag Click to View Related Outfits
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

// Import PreferenceCloud directly to avoid barrel export side effects
import { PreferenceCloud } from '@/components/ui/PreferenceCloud';

// =============================================================================
// Test Data
// =============================================================================

const mockCloudTags = [
  { tag: '简约', weight: 1.0, type: 'user' as const },
  { tag: '通勤', weight: 0.95, type: 'user' as const },
  { tag: '知性', weight: 0.9, type: 'user' as const },
  { tag: '黑白配色', weight: 0.8, type: 'inferred' as const },
  { tag: '阔腿裤', weight: 0.6, type: 'inferred' as const },
];

// =============================================================================
// Test Utilities
// =============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithProvider = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

// =============================================================================
// Tests
// =============================================================================

describe('Style Profile Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PreferenceCloud rendering', () => {
    it('should render PreferenceCloud with transformed data', () => {
      const { getByTestId, getByText } = renderWithProvider(
        <PreferenceCloud preferences={mockCloudTags} />
      );

      expect(getByTestId('preference-cloud')).toBeTruthy();
      expect(getByText('简约')).toBeTruthy();
      expect(getByText('通勤')).toBeTruthy();
      expect(getByText('知性')).toBeTruthy();
    });

    it('should render user and inferred tags correctly', () => {
      const { getByTestId } = renderWithProvider(
        <PreferenceCloud preferences={mockCloudTags} />
      );

      // User-selected tags
      expect(getByTestId('tag-简约')).toBeTruthy();
      expect(getByTestId('tag-通勤')).toBeTruthy();

      // AI-inferred tags
      expect(getByTestId('tag-黑白配色')).toBeTruthy();
      expect(getByTestId('tag-阔腿裤')).toBeTruthy();
    });

    it('should handle tag press with callback (AC#6)', () => {
      const onTagPress = jest.fn();
      const { getByTestId } = renderWithProvider(
        <PreferenceCloud preferences={mockCloudTags} onTagPress={onTagPress} />
      );

      fireEvent.press(getByTestId('tag-简约'));
      expect(onTagPress).toHaveBeenCalledWith('简约');
    });

    it('should render empty state when no preferences', () => {
      const { getByTestId, queryByText } = renderWithProvider(
        <PreferenceCloud preferences={[]} />
      );

      expect(getByTestId('preference-cloud')).toBeTruthy();
      expect(queryByText('简约')).toBeNull();
    });
  });

  describe('tag accessibility', () => {
    it('should have accessible tags with role and labels', () => {
      const { getByTestId } = renderWithProvider(
        <PreferenceCloud preferences={mockCloudTags} />
      );

      const userTag = getByTestId('tag-简约');
      expect(userTag.props.accessibilityRole).toBe('button');
      expect(userTag.props.accessibilityLabel).toContain('简约');
      expect(userTag.props.accessibilityLabel).toContain('用户选择');

      const inferredTag = getByTestId('tag-黑白配色');
      expect(inferredTag.props.accessibilityLabel).toContain('AI推断');
    });
  });
});
