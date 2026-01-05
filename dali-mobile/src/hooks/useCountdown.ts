/**
 * useCountdown Hook
 * Countdown timer for SMS resend functionality
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownReturn {
  /** Current countdown value in seconds */
  countdown: number;
  /** Whether countdown is active */
  isActive: boolean;
  /** Start the countdown */
  start: (seconds?: number) => void;
  /** Reset the countdown */
  reset: () => void;
}

/**
 * Hook for managing countdown timer
 * @param initialSeconds - Initial countdown value (default: 60)
 * @returns Countdown state and control functions
 */
export function useCountdown(initialSeconds = 60): UseCountdownReturn {
  const [countdown, setCountdown] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds = initialSeconds) => {
      clearCountdown();
      setCountdown(seconds);
      setIsActive(true);

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearCountdown();
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [initialSeconds, clearCountdown]
  );

  const reset = useCallback(() => {
    clearCountdown();
    setCountdown(0);
    setIsActive(false);
  }, [clearCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearCountdown();
  }, [clearCountdown]);

  return {
    countdown,
    isActive,
    start,
    reset,
  };
}
