import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import ConfirmModal from '@/features/shared/components/ConfirmModal';
import { getRestockRequests, updateRestockRequestStatus } from '@/services/restockRequestService';
import type { RestockRequest, RestockRequestStatus } from '@/types/restockRequest';
import { RESTOCK_STATUS_COLORS, RESTOCK_STATUS_LABELS } from '@/types/restockRequest';

interface PendingAction {
  request: RestockRequest;
  status: RestockRequestStatus;
}

export default function RestockRequestsScreen() {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const loadRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getRestockRequests();
      setRequests(data);
    } catch {
      Alert.alert('Error', 'Unable to load restock requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const confirmStatusUpdate = async () => {
    if (!pendingAction) return;
    const { request, status } = pendingAction;
    setPendingAction(null);
    try {
      const updated = await updateRestockRequestStatus(request.id, status);
      setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to update request.');
    }
  };

  const renderActions = (request: RestockRequest) => {
    if (request.status === 'pending') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => setPendingAction({ request, status: 'approved' })}
          >
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Restock Requests" onBackPress={() => router.back()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2B3A7E" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRequests(true)} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: RESTOCK_STATUS_COLORS[item.status] + '22' }]}>
                  <Text style={[styles.statusText, { color: RESTOCK_STATUS_COLORS[item.status] }]}>
                    {RESTOCK_STATUS_LABELS[item.status]}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.qtyText}>Requested Qty: {item.requestedQty}</Text>
              {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
              <Text style={styles.metaText}>Requested by {item.createdByName}</Text>
              {renderActions(item)}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No restock requests yet.</Text>
            </View>
          }
        />
      )}

      <ConfirmModal
        visible={!!pendingAction}
        title="Update Request"
        message={pendingAction ? `Set status to ${RESTOCK_STATUS_LABELS[pendingAction.status]}?` : ''}
        confirmLabel="Confirm"
        onConfirm={confirmStatusUpdate}
        onCancel={() => setPendingAction(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 110, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  dateText: { fontSize: 11, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' },
  productName: { fontSize: 15, color: '#111827', fontFamily: 'Poppins_700Bold' },
  qtyText: { fontSize: 13, color: '#374151', fontFamily: 'Poppins_500Medium' },
  notesText: { fontSize: 12, color: '#6B7280', fontFamily: 'Poppins_400Regular' },
  metaText: { fontSize: 11, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  approveBtn: { backgroundColor: '#E6EEFF' },
  approveText: { color: '#2B3A7E', fontFamily: 'Poppins_600SemiBold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { color: '#9CA3AF', fontFamily: 'Poppins_500Medium' },
});
