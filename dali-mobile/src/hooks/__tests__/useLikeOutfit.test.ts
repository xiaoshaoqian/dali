/**
 * useLikeOutfit Hook Tests
 * Tests for like/unlike outfit mutation hook
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */

import { useLikeOutfit } from '../useLikeOutfit';

// Track mutation calls
let mockMutate: jest.Mock;
let mockMutationOptions: {
  mutationFn?: (value: boolean) => Promise<{ isLiked: boolean }>;
  onMutate?: (value: boolean) => Promise<{ previousIsLiked: boolean }>;
  onError?: (error: Error, value: boolean, context?: { previousIsLiked: boolean }) => void;
  onSuccess?: (data: { isLiked: boolean }) => void;
};

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn((options) => {
    mockMutationOptions = options;
    mockMutate = jest.fn((value) => {
      if (options.mutationFn) {
        return options.mutationFn(value);
      }
    });
    return {
      mutate: mockMutate,
      isPending: false,
      error: null,
    };
  }),
  useQueryClient: jest.fn(() => ({
    cancelQueries: jest.fn().mockResolvedValue(undefined),
    invalidateQueries: jest.fn(),
  })),
}));

const mockAddPendingAction = jest.fn();
const mockUpdateOutfitLikeStatus = jest.fn().mockResolvedValue(undefined);

jest.mock('@/stores', () => ({
  useOfflineStore: jest.fn(() => ({
    isOnline: true,
    addPendingAction: mockAddPendingAction,
  })),
}));

jest.mock('@/utils', () => ({
  updateOutfitLikeStatus: (...args: unknown[]) => mockUpdateOutfitLikeStatus(...args),
}));

const mockLikeOutfit = jest.fn().mockResolvedValue({ isLiked: true });
const mockUnlikeOutfit = jest.fn().mockResolvedValue({ isLiked: false });

jest.mock('@/services', () => ({
  outfitService: {
    likeOutfit: (...args: unknown[]) => mockLikeOutfit(...args),
    unlikeOutfit: (...args: unknown[]) => mockUnlikeOutfit(...args),
  },
}));

describe('useLikeOutfit', () => {
  const mockOutfitId = 'test-outfit-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateOutfitLikeStatus.mockResolvedValue(undefined);
    mockLikeOutfit.mockResolvedValue({ isLiked: true });
    mockUnlikeOutfit.mockResolvedValue({ isLiked: false });
  });

  describe('initialization', () => {
    it('should return toggleLike function', () => {
      const result = useLikeOutfit(mockOutfitId, false);
      expect(typeof result.toggleLike).toBe('function');
    });

    it('should return like function', () => {
      const result = useLikeOutfit(mockOutfitId, false);
      expect(typeof result.like).toBe('function');
    });

    it('should return unlike function', () => {
      const result = useLikeOutfit(mockOutfitId, false);
      expect(typeof result.unlike).toBe('function');
    });

    it('should return isLoading state as false initially', () => {
      const result = useLikeOutfit(mockOutfitId, false);
      expect(result.isLoading).toBe(false);
    });

    it('should return error as null initially', () => {
      const result = useLikeOutfit(mockOutfitId, false);
      expect(result.error).toBeNull();
    });
  });

  describe('toggleLike', () => {
    it('should call mutate with opposite value when toggleLike is called', () => {
      const result = useLikeOutfit(mockOutfitId, false);
      result.toggleLike(false);
      expect(mockMutate).toHaveBeenCalledWith(true);
    });

    it('should call mutate with false when currently liked', () => {
      const result = useLikeOutfit(mockOutfitId, true);
      result.toggleLike(true);
      expect(mockMutate).toHaveBeenCalledWith(false);
    });
  });

  describe('like/unlike direct methods', () => {
    it('should call mutate with true when like() is called', () => {
      const result = useLikeOutfit(mockOutfitId, false);
      result.like();
      expect(mockMutate).toHaveBeenCalledWith(true);
    });

    it('should call mutate with false when unlike() is called', () => {
      const result = useLikeOutfit(mockOutfitId, true);
      result.unlike();
      expect(mockMutate).toHaveBeenCalledWith(false);
    });
  });

  describe('mutation behavior', () => {
    it('should update local SQLite first (optimistic update)', async () => {
      useLikeOutfit(mockOutfitId, false);

      // Call the mutationFn directly to test behavior
      await mockMutationOptions.mutationFn?.(true);

      expect(mockUpdateOutfitLikeStatus).toHaveBeenCalledWith(mockOutfitId, true);
    });

    it('should call likeOutfit API when liking online', async () => {
      useLikeOutfit(mockOutfitId, false);

      await mockMutationOptions.mutationFn?.(true);

      expect(mockLikeOutfit).toHaveBeenCalledWith(mockOutfitId);
    });

    it('should call unlikeOutfit API when unliking online', async () => {
      useLikeOutfit(mockOutfitId, true);

      await mockMutationOptions.mutationFn?.(false);

      expect(mockUnlikeOutfit).toHaveBeenCalledWith(mockOutfitId);
    });
  });

  describe('offline support', () => {
    it('should queue action when offline and not call API', async () => {
      const { useOfflineStore } = require('@/stores');
      useOfflineStore.mockReturnValue({
        isOnline: false,
        addPendingAction: mockAddPendingAction,
      });

      useLikeOutfit(mockOutfitId, false);

      const result = await mockMutationOptions.mutationFn?.(true);

      expect(mockAddPendingAction).toHaveBeenCalledWith('like', mockOutfitId);
      expect(mockLikeOutfit).not.toHaveBeenCalled();
      expect(result).toEqual({ isLiked: true });
    });

    it('should queue unlike action when offline', async () => {
      const { useOfflineStore } = require('@/stores');
      useOfflineStore.mockReturnValue({
        isOnline: false,
        addPendingAction: mockAddPendingAction,
      });

      useLikeOutfit(mockOutfitId, true);

      await mockMutationOptions.mutationFn?.(false);

      expect(mockAddPendingAction).toHaveBeenCalledWith('unlike', mockOutfitId);
    });
  });

  describe('error handling', () => {
    it('should rollback on error', async () => {
      useLikeOutfit(mockOutfitId, false);

      const context = { previousIsLiked: false };
      const error = new Error('API Error');

      mockMutationOptions.onError?.(error, true, context);

      expect(mockUpdateOutfitLikeStatus).toHaveBeenCalledWith(mockOutfitId, false);
    });

    it('should call onError callback when provided', async () => {
      const onError = jest.fn();
      useLikeOutfit(mockOutfitId, false, { onError });

      const error = new Error('API Error');
      mockMutationOptions.onError?.(error, true, { previousIsLiked: false });

      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe('success callback', () => {
    it('should call onSuccess callback when provided', () => {
      const onSuccess = jest.fn();
      useLikeOutfit(mockOutfitId, false, { onSuccess });

      mockMutationOptions.onSuccess?.({ isLiked: true });

      expect(onSuccess).toHaveBeenCalledWith(true);
    });
  });
});
