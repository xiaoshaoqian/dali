/**
 * useTheoryViewTracking Hook
 * Tracks when a user has read the theory explanation (stayed > 5 seconds)
 * Part of Story 4.3: Theory Explanation Text Generation and Display
 *
 * Used for NFR-AI3 quality analysis: >80% users should find explanations helpful
 */
import { useState, useEffect, useRef, useCallback } from 'react';

import { apiClient } from '@/services/apiClient';

// View tracking threshold in milliseconds (5 seconds)
const VIEW_THRESHOLD_MS = 5000;

// API response type
interface TheoryViewResponse {
  tracked: boolean;
}

// Feedback response type
interface TheoryFeedbackResponse {
  success: boolean;
}

/**
 * Track theory view event to backend
 */
async function trackTheoryView(outfitId: string, durationMs: number): Promise<void> {
  try {
    await apiClient.post<TheoryViewResponse>(`/outfits/${outfitId}/theory-view`, {
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Silently fail - analytics should not block UX
    console.warn('[TheoryViewTracking] Failed to track view:', error);
  }
}

/**
 * Submit theory feedback to backend
 */
export async function submitTheoryFeedback(
  outfitId: string,
  helpful: boolean
): Promise<boolean> {
  try {
    const response = await apiClient.post<TheoryFeedbackResponse>(
      `/outfits/${outfitId}/theory-feedback`,
      { helpful, timestamp: new Date().toISOString() }
    );
    return response.data.success;
  } catch (error) {
    console.warn('[TheoryViewTracking] Failed to submit feedback:', error);
    return false;
  }
}

/**
 * Hook to track user's theory explanation view time
 * @param outfitId - The outfit ID being viewed
 * @param isVisible - Whether the explanation is currently visible
 * @returns Object with tracking state
 */
export function useTheoryViewTracking(outfitId: string, isVisible: boolean) {
  const [hasTracked, setHasTracked] = useState(false);
  const [viewDuration, setViewDuration] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start tracking when visible
  useEffect(() => {
    if (isVisible && !hasTracked && outfitId) {
      startTimeRef.current = Date.now();

      // Update duration every second for UI feedback (optional)
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const duration = Date.now() - startTimeRef.current;
          setViewDuration(duration);

          // Track when threshold reached
          if (duration >= VIEW_THRESHOLD_MS && !hasTracked) {
            trackTheoryView(outfitId, duration);
            setHasTracked(true);

            // Clear interval after tracking
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      }, 1000);
    }

    return () => {
      // Track on unmount if threshold was reached but not yet tracked
      if (startTimeRef.current && !hasTracked) {
        const duration = Date.now() - startTimeRef.current;
        if (duration >= VIEW_THRESHOLD_MS) {
          trackTheoryView(outfitId, duration);
        }
      }

      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, outfitId, hasTracked]);

  // Reset when outfit changes
  useEffect(() => {
    setHasTracked(false);
    setViewDuration(0);
    startTimeRef.current = null;
  }, [outfitId]);

  const resetTracking = useCallback(() => {
    setHasTracked(false);
    setViewDuration(0);
    startTimeRef.current = null;
  }, []);

  return {
    /** Whether the view has been tracked (user stayed > 5s) */
    hasTracked,
    /** Current view duration in milliseconds */
    viewDuration,
    /** Threshold percentage (0-100) */
    thresholdProgress: Math.min((viewDuration / VIEW_THRESHOLD_MS) * 100, 100),
    /** Reset tracking state */
    resetTracking,
  };
}
