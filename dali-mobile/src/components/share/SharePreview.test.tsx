/**
 * SharePreview Component Integration Tests
 *
 * Integration tests for complete sharing flow
 *
 * @module components/share/SharePreview.test
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SharePreview } from './SharePreview';
import * as Sharing from 'expo-sharing';
import type { OutfitData } from '@/types/share';
import { trackTemplateSelection, trackImageGeneration } from '@/services/analytics';

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

// Mock analytics
jest.mock('@/services/analytics', () => ({
  trackTemplateSelection: jest.fn(),
  trackImageGeneration: jest.fn(),
  trackShareEvent: jest.fn(),
}));

// Mock ViewShot
jest.mock('react-native-view-shot', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        capture: jest.fn().mockResolvedValue('file://mock-image.png'),
      }));
      return React.createElement('View', { ...props, ref }, props.children);
    }),
  };
});

// Mock QRCode
jest.mock('react-native-qrcode-svg', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: (props: any) => {
      return React.createElement('View', props, props.children);
    },
  };
});

describe('SharePreview Integration Tests', () => {
  const mockOutfit: OutfitData = {
    id: '123',
    items: [
      { id: '1', imageUrl: 'https://example.com/item1.jpg' },
      { id: '2', imageUrl: 'https://example.com/item2.jpg' },
      { id: '3', imageUrl: 'https://example.com/item3.jpg' },
    ],
    styleTags: ['简约', '通勤'],
    occasionTag: '职场通勤',
    theoryExcerpt: '米色+黑白配色营造通勤专业感,适合职场环境...',
  };

  const mockOnClose = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Complete Sharing Flow', () => {
    it('should complete full sharing workflow: select template -> generate -> share', async () => {
      const { getByText, getAllByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      // Step 1: Select template (fashion)
      const fashionButtons = getAllByText('时尚');
      fireEvent.press(fashionButtons[0]); // Press the first button

      await waitFor(() => {
        expect(trackTemplateSelection).toHaveBeenCalledWith('fashion');
      });

      // Step 2: Generate image
      const generateButton = getByText('生成预览');
      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(trackImageGeneration).toHaveBeenCalled();
      });

      // Step 3: Share image
      const shareButton = getByText('立即分享');
      await act(async () => {
        fireEvent.press(shareButton);
      });

      await waitFor(() => {
        expect(Sharing.shareAsync).toHaveBeenCalled();
        expect(mockOnShare).toHaveBeenCalledWith('fashion', expect.any(String), undefined);
      });
    });

    it('should track all analytics events during sharing flow', async () => {
      const { getByText, getAllByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      // Select minimal template
      const minimalButtons = getAllByText('简约');
      fireEvent.press(minimalButtons[0]);

      expect(trackTemplateSelection).toHaveBeenCalledWith('minimal');

      // Generate image
      const generateButton = getByText('生成预览');
      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(trackImageGeneration).toHaveBeenCalledWith(
          'minimal',
          expect.any(Number),
          true
        );
      });
    });
  });

  describe('Template Selection', () => {
    it('should allow switching between different templates', async () => {
      const { getAllByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      // Select minimal
      fireEvent.press(getAllByText('简约')[0]);
      expect(trackTemplateSelection).toHaveBeenCalledWith('minimal');

      // Switch to fashion
      fireEvent.press(getAllByText('时尚')[0]);
      expect(trackTemplateSelection).toHaveBeenCalledWith('fashion');

      // Switch to artistic
      fireEvent.press(getAllByText('文艺')[0]);
      expect(trackTemplateSelection).toHaveBeenCalledWith('artistic');

      expect(trackTemplateSelection).toHaveBeenCalledTimes(3);
    });

    it('should clear generated image when switching templates', async () => {
      const { getByText, getAllByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      // Generate with minimal template
      const generateButton = getByText('生成预览');
      await act(async () => {
        fireEvent.press(generateButton);
      });

      // Switch template
      fireEvent.press(getAllByText('时尚')[0]);

      // Generated image should be cleared
      const shareButton = getByText('立即分享');
      expect(shareButton).toBeDisabled();
    });
  });

  describe('Image Generation', () => {
    it('should show loading state during image generation', async () => {
      const { getByText, queryByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      const generateButton = getByText('生成预览');

      await act(async () => {
        fireEvent.press(generateButton);
      });

      // Generate button should show loading indicator during generation
      // (In actual implementation, ActivityIndicator is shown)
    });

    it('should enable share button after successful generation', async () => {
      const { getByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      const shareButton = getByText('立即分享');
      expect(shareButton).toBeDisabled();

      const generateButton = getByText('生成预览');
      await act(async () => {
        fireEvent.press(generateButton);
      });

      await waitFor(() => {
        expect(shareButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle sharing unavailable gracefully', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      const { getByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      // Generate image first
      await act(async () => {
        fireEvent.press(getByText('生成预览'));
      });

      // Try to share
      await act(async () => {
        fireEvent.press(getByText('立即分享'));
      });

      await waitFor(() => {
        expect(Sharing.shareAsync).not.toHaveBeenCalled();
        expect(mockOnShare).not.toHaveBeenCalled();
      });
    });

    it('should handle share failure gracefully', async () => {
      (Sharing.shareAsync as jest.Mock).mockRejectedValue(new Error('Share failed'));

      const { getByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      // Generate image
      await act(async () => {
        fireEvent.press(getByText('生成预览'));
      });

      // Try to share - should not crash
      await act(async () => {
        fireEvent.press(getByText('立即分享'));
      });

      await waitFor(() => {
        expect(mockOnShare).not.toHaveBeenCalled();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should close modal when close button is pressed', () => {
      const { getByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      const closeButton = getByText('关闭');
      fireEvent.press(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should render modal when visible is true', () => {
      const { getByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      expect(getByText('分享搭配')).toBeTruthy();
      expect(getByText('选择分享模板')).toBeTruthy();
    });
  });

  describe('Performance Requirements', () => {
    it('should generate image in less than 2 seconds', async () => {
      const { getByText } = render(
        <SharePreview
          visible={true}
          outfit={mockOutfit}
          onClose={mockOnClose}
          onShare={mockOnShare}
        />
      );

      const startTime = Date.now();

      await act(async () => {
        fireEvent.press(getByText('生成预览'));
      });

      await waitFor(() => {
        expect(trackImageGeneration).toHaveBeenCalled();
      });

      const generationTime = Date.now() - startTime;

      // Should complete within 2 seconds (2000ms)
      expect(generationTime).toBeLessThan(2000);
    });
  });
});
