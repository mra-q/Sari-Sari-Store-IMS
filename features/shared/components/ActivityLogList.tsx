import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StockMovement } from '@/types/stockMovement';
import { MOVEMENT_REASON_LABELS } from '@/types/stockMovement';

interface ActivityLogListProps {
  movements: StockMovement[];
  loading?: boolean;
  emptyMessage?: string;
}

function MovementItem({ item }: { item: StockMovement }) {
  const isIn = item.direction === 'in';
  const date = new Date(item.createdAt);
  const dateStr = date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.item}>
      <View style={[styles.iconWrap, isIn ? styles.iconIn : styles.iconOut]}>
        <Ionicons
          name={isIn ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
          size={20}
          color={isIn ? '#10B981' : '#EF4444'}
        />
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
        <Text style={styles.reasonText}>{MOVEMENT_REASON_LABELS[item.reason]}</Text>
        {!!item.notes && <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>}
        <Text style={styles.meta}>{item.performedByName} · {dateStr} {timeStr}</Text>
      </View>
      <View style={styles.qtyWrap}>
        <Text style={[styles.qty, isIn ? styles.qtyIn : styles.qtyOut]}>
          {isIn ? '+' : '-'}{item.quantity}
        </Text>
        <Text style={styles.stockRange}>
          {item.previousStock} → {item.newStock}
        </Text>
      </View>
    </View>
  );
}

export default function ActivityLogList({
  movements,
  loading,
  emptyMessage = 'No activity yet.',
}: ActivityLogListProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={movements}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MovementItem item={item} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="time-outline" size={40} color="#D1D5DB" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { color: '#9CA3AF', fontFamily: 'Poppins_500Medium', fontSize: 14 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconIn: { backgroundColor: '#D1FAE5' },
  iconOut: { backgroundColor: '#FEE2E2' },
  itemBody: { flex: 1, gap: 2 },
  productName: { fontSize: 14, color: '#111827', fontFamily: 'Poppins_600SemiBold' },
  reasonText: { fontSize: 12, color: '#6B7280', fontFamily: 'Poppins_500Medium' },
  notes: { fontSize: 11, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' },
  meta: { fontSize: 11, color: '#9CA3AF', fontFamily: 'Poppins_400Regular', marginTop: 2 },
  qtyWrap: { alignItems: 'flex-end', gap: 2 },
  qty: { fontSize: 16, fontFamily: 'Poppins_700Bold' },
  qtyIn: { color: '#10B981' },
  qtyOut: { color: '#EF4444' },
  stockRange: { fontSize: 11, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' },
});
