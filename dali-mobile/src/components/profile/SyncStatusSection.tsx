/**
 * SyncStatusSection Component
 * Displays sync status information in the settings page
 *
 * @see Story 8.3: AC#12 - Settings page sync status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSyncStatus, useNetworkStatus } from '@/hooks';

// =============================================================================
// Types
// =============================================================================

export interface SyncStatusSectionProps {
  /** Callback when manual sync is triggered */
  onSyncPress?: () => void;
  /** Whether to show the manual sync button */
  showSyncButton?: boolean;
}

// =============================================================================
// Component
// =============================================================================

/**
 * SyncStatusSection displays current sync state with option to manually trigger sync
 */
export function SyncStatusSection({
  onSyncPress,
  showSyncButton = true,
}: SyncStatusSectionProps): React.ReactElement {
  const { isSyncing, lastSyncTimeFormatted, pendingSyncCount } = useSyncStatus();
  const { isOnline } = useNetworkStatus();

  const getStatusIcon = (): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    if (!isOnline) {
      return { name: 'cloud-offline-outline', color: '#F59E0B' };
    }
    if (isSyncing) {
      return { name: 'sync', color: '#3B82F6' };
    }
    if (pendingSyncCount > 0) {
      return { name: 'cloud-upload-outline', color: '#F59E0B' };
    }
    return { name: 'cloud-done-outline', color: '#10B981' };
  };

  const getStatusText = (): string => {
    if (!isOnline) {
      return '离线模式';
    }
    if (isSyncing) {
      return '正在同步...';
    }
    if (pendingSyncCount > 0) {
      return `${pendingSyncCount} 项待同步`;
    }
    return '已同步';
  };

  const { name: iconName, color: iconColor } = getStatusIcon();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cloud-outline" size={22} color="#374151" />
        <Text style={styles.title}>云同步</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusRow}>
          <View style={styles.statusIcon}>
            {isSyncing ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Ionicons name={iconName} size={20} color={iconColor} />
            )}
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: iconColor }]}>{getStatusText()}</Text>
            <Text style={styles.lastSyncText}>上次同步: {lastSyncTimeFormatted}</Text>
          </View>

          {showSyncButton && isOnline && !isSyncing && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={onSyncPress}
              accessibilityLabel="手动同步"
              accessibilityRole="button"
            >
              <Ionicons name="refresh-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>

        {pendingSyncCount > 0 && isOnline && (
          <View style={styles.pendingInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.pendingText}>
              有 {pendingSyncCount} 项数据等待同步，将在网络恢复后自动上传
            </Text>
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineInfo}>
            <Ionicons name="warning-outline" size={16} color="#F59E0B" />
            <Text style={styles.offlineText}>
              离线模式下所做的更改将在网络恢复后自动同步
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  statusIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  lastSyncText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  syncButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  offlineInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  offlineText: {
    flex: 1,
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 18,
  },
});

export default SyncStatusSection;
