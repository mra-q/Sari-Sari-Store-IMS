import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CardboardHeader from '@/components/CardboardHeader';
import ActivityLogList from '@/features/shared/components/ActivityLogList';
import { getStockMovements } from '@/services/stockMovementService';
import { useAuth } from '@/context/AuthContext';
import type { StockMovement } from '@/types/stockMovement';

export default function StaffActivityLogScreen() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const all = await getStockMovements();
      setMovements(all.filter((m) => m.performedBy === user?.id));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const todayCount = movements.filter((m) => {
    const today = new Date().toDateString();
    return new Date(m.createdAt).toDateString() === today;
  }).length;

  const inCount = movements.filter((m) => m.direction === 'in').length;
  const outCount = movements.filter((m) => m.direction === 'out').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
      >
        <View style={styles.headerContent}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconWrap}>
                <Ionicons name="time-outline" size={24} color="#2B3A7E" />
              </View>
              <View style={styles.summaryTextBlock}>
                <Text style={styles.summaryEyebrow}>Activity Log</Text>
                <Text style={styles.summaryTitle}>My Stock Movements</Text>
                <Text style={styles.summarySubtitle}>
                  Track all your inventory actions and changes.
                </Text>
              </View>
            </View>

            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStatCard}>
                <Text style={styles.summaryStatValue}>{movements.length}</Text>
                <Text style={styles.summaryStatLabel}>Total Actions</Text>
              </View>
              <View style={[styles.summaryStatCard, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.summaryStatValue, { color: '#10B981' }]}>{inCount}</Text>
                <Text style={styles.summaryStatLabel}>Stock In</Text>
              </View>
              <View style={[styles.summaryStatCard, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.summaryStatValue, { color: '#EF4444' }]}>{outCount}</Text>
                <Text style={styles.summaryStatLabel}>Stock Out</Text>
              </View>
            </View>

            <View style={styles.summaryFooter}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.summaryFooterText}>
                {todayCount} action{todayCount === 1 ? '' : 's'} today
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionSubtitle}>
              Your latest stock movements and updates
            </Text>
          </View>
        </View>

        <ActivityLogList
          movements={movements}
          loading={loading}
          emptyMessage="You have no recorded activity yet."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { flex: 1 },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  summaryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextBlock: {
    flex: 1,
  },
  summaryEyebrow: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
    marginTop: 4,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryStatCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  summaryStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryFooterText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
});
