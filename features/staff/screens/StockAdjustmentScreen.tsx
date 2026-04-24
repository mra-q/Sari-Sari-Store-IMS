import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';
import StockAdjustmentForm from '@/features/shared/components/StockAdjustmentForm';
import ConfirmModal from '@/features/shared/components/ConfirmModal';
import { createStockMovement } from '@/services/stockMovementService';
import { useAuth } from '@/context/AuthContext';
import type { MovementDirection, MovementReason } from '@/types/stockMovement';
import { MOVEMENT_REASON_LABELS } from '@/types/stockMovement';

export default function StaffStockAdjustmentScreen() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    productId: string;
    direction: MovementDirection;
    reason: MovementReason;
    quantity: number;
    notes: string;
  } | null>(null);

  const handleSubmit = async (
    productId: string,
    direction: MovementDirection,
    reason: MovementReason,
    quantity: number,
    notes: string,
  ) => {
    setPendingPayload({ productId, direction, reason, quantity, notes });
  };

  const handleConfirm = async () => {
    if (!pendingPayload || !user) return;
    setPendingPayload(null);
    setSubmitting(true);
    try {
      await createStockMovement(pendingPayload, user.id, user.name);
      Alert.alert('Success', 'Stock adjustment recorded.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to record adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmMessage = pendingPayload
    ? `${pendingPayload.direction === 'out' ? 'Remove' : 'Add'} ${pendingPayload.quantity} unit(s) — Reason: ${MOVEMENT_REASON_LABELS[pendingPayload.reason]}`
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Stock Adjustment" onBackPress={() => router.back()} />
      <StockAdjustmentForm onSubmit={handleSubmit} submitting={submitting} />
      <ConfirmModal
        visible={!!pendingPayload}
        title="Confirm Adjustment"
        message={confirmMessage}
        confirmLabel="Apply"
        onConfirm={handleConfirm}
        onCancel={() => setPendingPayload(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
});
