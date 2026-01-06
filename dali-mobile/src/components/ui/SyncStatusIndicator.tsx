/**
 * Sync Status Indicator Component
 * Displays sync status information for the settings page
 *
 * @see Story 5.4: Cloud Sync Service (Last-Write-Wins Strategy)
 * @see AC #10: Display sync status with manual sync button
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSyncStatus, useNetworkStatus } from '@/hooks';
import { syncService } from '@/services/sync';

interface SyncStatusIndicatorProps {
  /** Show compact version (icon only) */
  compact?: boolean;
  /** Called when sync completes */
  onSyncComplete?: (result: { uploaded: number; downloaded: number }) => void;
}

/**
 * SyncStatusIndicator - Shows sync status and provides manual sync button
 *
 * Usage:
 * - Full view: <SyncStatusIndicator /> for settings page
 * - Compact: <SyncStatusIndicator compact /> for header/status bar
 */
export function SyncStatusIndicator({
  compact = false,
  onSyncComplete,
}: SyncStatusIndicatorProps) {
  const { isSyncing, lastSyncTimeFormatted, pendingSyncCount } = useSyncStatus();
  const { isOnline } = useNetworkStatus();

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;

    const result = await syncService.manualSync();
    onSyncComplete?.({
      uploaded: result.uploaded,
      downloaded: result.downloaded,
    });
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#6C63FF" />
        ) : pendingSyncCount > 0 ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>
              {pendingSyncCount > 99 ? '99+' : pendingSyncCount}
            </Text>
          </View>
        ) : (
          <View style={styles.syncedIndicator} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <Text style={styles.label}>上次同步</Text>
          <Text style={styles.value}>{lastSyncTimeFormatted}</Text>
        </View>

        <View style={styles.statusInfo}>
          <Text style={styles.label}>待同步</Text>
          <Text style={[styles.value, pendingSyncCount > 0 && styles.pendingValue]}>
            {pendingSyncCount} 条
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.syncButton,
          (!isOnline || isSyncing) && styles.syncButtonDisabled,
        ]}
        onPress={handleManualSync}
        disabled={!isOnline || isSyncing}
        activeOpacity={0.7}
      >
        {isSyncing ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.syncButtonText}>同步中...</Text>
          </>
        ) : !isOnline ? (
          <Text style={styles.syncButtonText}>离线状态</Text>
        ) : (
          <Text style={styles.syncButtonText}>立即同步</Text>
        )}
      </TouchableOpacity>

      {!isOnline && (
        <Text style={styles.offlineHint}>
          网络连接后将自动同步
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compactContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  pendingValue: {
    color: '#FF6B9D',
  },
  syncButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  offlineHint: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  pendingBadge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  syncedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
});

export default SyncStatusIndicator;
