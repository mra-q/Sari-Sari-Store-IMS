import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { syncService } from '@/services/sync/syncService';

export const SyncStatusBadge = () => {
  const { isOnline, isSyncing, pendingCount } = useSyncStatus();

  const handleManualSync = async () => {
    const result = await syncService.syncNow();
    console.log(result.message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.indicator, isOnline ? styles.online : styles.offline]} />
        <Text style={styles.statusText}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
        {isSyncing && <Text style={styles.syncingText}> • Syncing...</Text>}
      </View>
      
      {pendingCount > 0 && (
        <TouchableOpacity onPress={handleManualSync} style={styles.syncButton}>
          <Text style={styles.syncButtonText}>
            Sync {pendingCount} item{pendingCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  online: {
    backgroundColor: '#10b981',
  },
  offline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  syncingText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  syncButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
