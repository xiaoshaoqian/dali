/**
 * Auth Store
 * Zustand store for authentication state
 */
import { create } from 'zustand';

import { setOnAuthFailure } from '@/services/apiClient';
import { authService } from '@/services/authService';

interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether this is a new user (needs onboarding) */
  isNewUser: boolean;
  /** User ID from token */
  userId: string | null;
  /** Whether auth state is being initialized */
  isLoading: boolean;
  /** Set authenticated state */
  setAuthenticated: (userId: string, isNewUser: boolean) => void;
  /** Logout and clear tokens */
  logout: () => Promise<void>;
  /** Initialize auth state from stored tokens (with auto-refresh) */
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Set up auth failure callback to trigger logout
  setOnAuthFailure(() => {
    get().logout();
  });

  return {
    isAuthenticated: false,
    isNewUser: false,
    userId: null,
    isLoading: true,

  setAuthenticated: (userId, isNewUser) =>
    set({
      isAuthenticated: true,
      userId,
      isNewUser,
      isLoading: false,
    }),

  logout: async () => {
    await authService.clearTokens();
    set({
      isAuthenticated: false,
      userId: null,
      isNewUser: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    try {
      // Try to get a valid access token (will refresh if expired)
      const validToken = await authService.getValidAccessToken();

      if (validToken) {
        // Get userId from stored token
        const userId = await authService.getUserIdFromToken();
        if (userId) {
          // User has valid tokens with userId
          set({
            isAuthenticated: true,
            userId,
            isNewUser: false,
            isLoading: false,
          });
          return;
        }
      }

      // No valid token or userId - user needs to login
      await authService.clearTokens();
      set({
        isAuthenticated: false,
        userId: null,
        isLoading: false,
      });
    } catch {
      // Error during initialization - clear tokens and require login
      await authService.clearTokens();
      set({
        isAuthenticated: false,
        userId: null,
        isLoading: false,
      });
    }
  },
  };
});
