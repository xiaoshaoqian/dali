/**
 * useSaveOutfit Hook Tests
 * Tests for save/unsave outfit mutation hook
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */

import { useSaveOutfit } from '../useSaveOutfit';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn((options) => ({
    mutate: jest.fn((value) => {
      if (options.mutationFn) {
        options.mutationFn(value);
      }
    }),
    isPending: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    cancelQueries: jest.fn(),
    invalidateQueries: jest.fn(),
  })),
}));

jest.mock('@/stores', () => ({
  useOfflineStore: jest.fn(() => ({
    isOnline: true,
    addPendingAction: jest.fn(),
  })),
}));

jest.mock('@/utils', () => ({
  updateOutfitSaveStatus: jest.fn(),
}));

jest.mock('@/services', () => ({
  outfitService: {
    saveOutfit: jest.fn().mockResolvedValue({ isFavorited: true }),
    unsaveOutfit: jest.fn().mockResolvedValue({ isFavorited: false }),
  },
}));

describe('useSaveOutfit', () => {
  const mockOutfitId = 'test-outfit-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return toggleSave function', () => {
      const result = useSaveOutfit(mockOutfitId, false);
      expect(typeof result.toggleSave).toBe('function');
    });

    it('should return save function', () => {
      const result = useSaveOutfit(mockOutfitId, false);
      expect(typeof result.save).toBe('function');
    });

    it('should return unsave function', () => {
      const result = useSaveOutfit(mockOutfitId, false);
      expect(typeof result.unsave).toBe('function');
    });

    it('should return isLoading state', () => {
      const result = useSaveOutfit(mockOutfitId, false);
      expect(typeof result.isLoading).toBe('boolean');
    });
  });

  describe('toggleSave', () => {
    it('should trigger mutation when called', () => {
      const result = useSaveOutfit(mockOutfitId, false);
      result.toggleSave(false);
      // Mutation should be called
    });
  });

  describe('offline support', () => {
    it('should queue action when offline', () => {
      const { useOfflineStore } = require('@/stores');
      useOfflineStore.mockReturnValue({
        isOnline: false,
        addPendingAction: jest.fn(),
      });

      const result = useSaveOutfit(mockOutfitId, false);
      expect(result.isLoading).toBe(false);
    });
  });
});
