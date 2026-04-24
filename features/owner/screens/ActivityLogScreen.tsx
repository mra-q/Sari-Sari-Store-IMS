import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';
import ActivityLogList from '@/features/shared/components/ActivityLogList';
import { getStockMovements } from '@/services/stockMovementService';
import type { StockMovement } from '@/types/stockMovement';

export default function OwnerActivityLogScreen() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getStockMovements();
      setMovements(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Activity Log" onBackPress={() => router.back()} />
      <View style={styles.body}>
        <ActivityLogList
          movements={movements}
          loading={loading}
          emptyMessage="No stock movements recorded yet."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  body: { flex: 1 },
});
