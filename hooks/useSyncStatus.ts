import { useState, useEffect } from 'react';
import { networkService } from '../services/sync/networkService';
import { queueService } from '../services/sync/queueService';
import { syncService } from '../services/sync/syncService';

export const useSyncStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState('');

  useEffect(() => {
    // Check initial connection
    networkService.isConnected().then(setIsOnline);

    // Listen for connectivity changes
    const unsubscribe = networkService.onConnectivityChange(setIsOnline);

    // Update pending count
    const updatePendingCount = async () => {
      const count = await queueService.getQueueCount();
      setPendingCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const manualSync = async () => {
    setIsSyncing(true);
    const result = await syncService.syncNow();
    setLastSyncMessage(result.message);
    setIsSyncing(false);
    
    // Update pending count
    const count = await queueService.getQueueCount();
    setPendingCount(count);
    
    return result;
  };

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncMessage,
    manualSync
  };
};
