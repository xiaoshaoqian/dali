/**
 * Offline Store Tests
 * Tests for offline action queue store
 *
 * @see Story 3.5: Outfit Feedback (Like & Save)
 */

import { useOfflineStore } from '../offlineStore';

describe('offlineStore', () => {
  beforeEach(() => {
    // Reset store state
    useOfflineStore.setState({
      isOnline: true,
      pendingActions: [],
      isSyncing: false,
    });
  });

  describe('setOnline', () => {
    it('should update online status', () => {
      const { setOnline } = useOfflineStore.getState();

      setOnline(false);
      expect(useOfflineStore.getState().isOnline).toBe(false);

      setOnline(true);
      expect(useOfflineStore.getState().isOnline).toBe(true);
    });
  });

  describe('addPendingAction', () => {
    it('should add action to pending queue', () => {
      const { addPendingAction } = useOfflineStore.getState();

      addPendingAction('like', 'outfit-123');

      const { pendingActions } = useOfflineStore.getState();
      expect(pendingActions).toHaveLength(1);
      expect(pendingActions[0].type).toBe('like');
      expect(pendingActions[0].outfitId).toBe('outfit-123');
    });

    it('should include timestamp in action', () => {
      const { addPendingAction } = useOfflineStore.getState();

      addPendingAction('save', 'outfit-123');

      const { pendingActions } = useOfflineStore.getState();
      expect(pendingActions[0].timestamp).toBeDefined();
      expect(typeof pendingActions[0].timestamp).toBe('number');
    });

    it('should remove opposite action for same outfit', () => {
      const { addPendingAction } = useOfflineStore.getState();

      // Add like action
      addPendingAction('like', 'outfit-123');
      expect(useOfflineStore.getState().pendingActions).toHaveLength(1);

      // Add unlike action - should remove like
      addPendingAction('unlike', 'outfit-123');

      const { pendingActions } = useOfflineStore.getState();
      expect(pendingActions).toHaveLength(1);
      expect(pendingActions[0].type).toBe('unlike');
    });

    it('should not affect actions for different outfits', () => {
      const { addPendingAction } = useOfflineStore.getState();

      addPendingAction('like', 'outfit-123');
      addPendingAction('like', 'outfit-456');

      const { pendingActions } = useOfflineStore.getState();
      expect(pendingActions).toHaveLength(2);
    });
  });

  describe('removePendingAction', () => {
    it('should remove action by ID', () => {
      const { addPendingAction, removePendingAction } =
        useOfflineStore.getState();

      addPendingAction('like', 'outfit-123');
      const { pendingActions: before } = useOfflineStore.getState();
      const actionId = before[0].id;

      removePendingAction(actionId);

      const { pendingActions: after } = useOfflineStore.getState();
      expect(after).toHaveLength(0);
    });
  });

  describe('setSyncing', () => {
    it('should update syncing status', () => {
      const { setSyncing } = useOfflineStore.getState();

      setSyncing(true);
      expect(useOfflineStore.getState().isSyncing).toBe(true);

      setSyncing(false);
      expect(useOfflineStore.getState().isSyncing).toBe(false);
    });
  });

  describe('clearPendingActions', () => {
    it('should clear all pending actions', () => {
      const { addPendingAction, clearPendingActions } =
        useOfflineStore.getState();

      addPendingAction('like', 'outfit-1');
      addPendingAction('save', 'outfit-2');
      expect(useOfflineStore.getState().pendingActions).toHaveLength(2);

      clearPendingActions();
      expect(useOfflineStore.getState().pendingActions).toHaveLength(0);
    });
  });

  describe('getPendingActionsForOutfit', () => {
    it('should return actions for specific outfit', () => {
      const { addPendingAction, getPendingActionsForOutfit } =
        useOfflineStore.getState();

      addPendingAction('like', 'outfit-123');
      addPendingAction('save', 'outfit-123');
      addPendingAction('like', 'outfit-456');

      const actions = getPendingActionsForOutfit('outfit-123');
      expect(actions).toHaveLength(2);
      expect(actions.every((a) => a.outfitId === 'outfit-123')).toBe(true);
    });

    it('should return empty array for outfit with no actions', () => {
      const { getPendingActionsForOutfit } = useOfflineStore.getState();

      const actions = getPendingActionsForOutfit('non-existent');
      expect(actions).toHaveLength(0);
    });
  });
});
