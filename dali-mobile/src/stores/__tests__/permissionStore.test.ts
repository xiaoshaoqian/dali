/**
 * Permission Store Tests
 * Tests for permission state persistence
 *
 * @see Story 8.1: Permission Manager with Friendly Prompts
 * @see AC#11: Permission State Persistence
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { usePermissionStore } from '../permissionStore';

describe('permissionStore', () => {
  beforeEach(async () => {
    // Reset store to initial state
    await act(async () => {
      usePermissionStore.getState().reset();
    });
    await AsyncStorage.clear();
  });

  describe('initial state', () => {
    it('should have all permissions as undetermined initially', () => {
      const { statuses } = usePermissionStore.getState();

      expect(statuses.camera).toBe('undetermined');
      expect(statuses.mediaLibrary).toBe('undetermined');
      expect(statuses.location).toBe('undetermined');
      expect(statuses.notification).toBe('undetermined');
    });

    it('should have all request counts at 0 initially', () => {
      const { requestCounts } = usePermissionStore.getState();

      expect(requestCounts.camera).toBe(0);
      expect(requestCounts.mediaLibrary).toBe(0);
      expect(requestCounts.location).toBe(0);
      expect(requestCounts.notification).toBe(0);
    });

    it('should have null push token initially', () => {
      const { pushToken } = usePermissionStore.getState();
      expect(pushToken).toBeNull();
    });
  });

  describe('setStatus', () => {
    it('should update camera status', () => {
      act(() => {
        usePermissionStore.getState().setStatus('camera', 'granted');
      });

      expect(usePermissionStore.getState().statuses.camera).toBe('granted');
    });

    it('should update location status', () => {
      act(() => {
        usePermissionStore.getState().setStatus('location', 'denied');
      });

      expect(usePermissionStore.getState().statuses.location).toBe('denied');
    });

    it('should not affect other permission statuses', () => {
      act(() => {
        usePermissionStore.getState().setStatus('camera', 'granted');
      });

      expect(usePermissionStore.getState().statuses.mediaLibrary).toBe('undetermined');
      expect(usePermissionStore.getState().statuses.location).toBe('undetermined');
    });
  });

  describe('incrementRequestCount', () => {
    it('should increment request count for camera', () => {
      act(() => {
        usePermissionStore.getState().incrementRequestCount('camera');
      });

      expect(usePermissionStore.getState().requestCounts.camera).toBe(1);
    });

    it('should increment request count multiple times', () => {
      act(() => {
        usePermissionStore.getState().incrementRequestCount('notification');
        usePermissionStore.getState().incrementRequestCount('notification');
      });

      expect(usePermissionStore.getState().requestCounts.notification).toBe(2);
    });
  });

  describe('getRequestCount', () => {
    it('should return current request count', () => {
      act(() => {
        usePermissionStore.getState().incrementRequestCount('mediaLibrary');
      });

      expect(usePermissionStore.getState().getRequestCount('mediaLibrary')).toBe(1);
    });
  });

  describe('shouldShowRequest (AC#11)', () => {
    it('should return true when permission is undetermined and count is 0', () => {
      expect(usePermissionStore.getState().shouldShowRequest('camera')).toBe(true);
    });

    it('should return false when permission is already granted', () => {
      act(() => {
        usePermissionStore.getState().setStatus('camera', 'granted');
      });

      expect(usePermissionStore.getState().shouldShowRequest('camera')).toBe(false);
    });

    it('should return false when request count >= 2', () => {
      act(() => {
        usePermissionStore.getState().incrementRequestCount('location');
        usePermissionStore.getState().incrementRequestCount('location');
      });

      expect(usePermissionStore.getState().shouldShowRequest('location')).toBe(false);
    });

    it('should return true when count is 1 and not granted', () => {
      act(() => {
        usePermissionStore.getState().incrementRequestCount('notification');
        usePermissionStore.getState().setStatus('notification', 'denied');
      });

      expect(usePermissionStore.getState().shouldShowRequest('notification')).toBe(true);
    });
  });

  describe('setPushToken', () => {
    it('should store push token', () => {
      act(() => {
        usePermissionStore.getState().setPushToken('ExponentPushToken[test-token]');
      });

      expect(usePermissionStore.getState().pushToken).toBe('ExponentPushToken[test-token]');
    });

    it('should allow clearing push token', () => {
      act(() => {
        usePermissionStore.getState().setPushToken('ExponentPushToken[test-token]');
        usePermissionStore.getState().setPushToken(null);
      });

      expect(usePermissionStore.getState().pushToken).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Set some state first
      act(() => {
        usePermissionStore.getState().setStatus('camera', 'granted');
        usePermissionStore.getState().setStatus('location', 'denied');
        usePermissionStore.getState().incrementRequestCount('notification');
        usePermissionStore.getState().setPushToken('test-token');
      });

      // Reset
      act(() => {
        usePermissionStore.getState().reset();
      });

      const state = usePermissionStore.getState();
      expect(state.statuses.camera).toBe('undetermined');
      expect(state.statuses.location).toBe('undetermined');
      expect(state.requestCounts.notification).toBe(0);
      expect(state.pushToken).toBeNull();
    });
  });
});
