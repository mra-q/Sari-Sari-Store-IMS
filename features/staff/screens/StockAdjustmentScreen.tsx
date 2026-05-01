import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import StockAdjustmentForm from '@/features/shared/components/StockAdjustmentForm';
import ConfirmModal from '@/features/shared/components/ConfirmModal';
import { createStockMovement } from '@/services/stockMovementService';
import { useAuth } from '@/context/AuthContext';
import type { MovementDirection, MovementReason } from '@/types/stockMovement';
import { MOVEMENT_REASON_LABELS } from '@/types/stockMovement';

export default function StaffStockAdjustmentScreen() {
  const params = useLocalSearchParams<{ productId?: string; returnTo?: string }>();
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
    const payload = pendingPayload;
    setPendingPayload(null);
    setSubmitting(true);
    try {
      await createStockMovement(payload, user.id, user.name);
      setSubmitting(false);
      router.dismiss();
      setTimeout(() => {
        Alert.alert('Success', 'Stock adjustment recorded.');
      }, 100);
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Error', err?.message ?? 'Failed to record adjustment.');
    }
  };

  const confirmMessage = pendingPayload
    ? `${pendingPayload.direction === 'out' ? 'Remove' : 'Add'} ${pendingPayload.quantity} unit(s) — Reason: ${MOVEMENT_REASON_LABELS[pendingPayload.reason]}`
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Stock Adjustment" onBackPress={() => router.dismiss()} />
      <StockAdjustmentForm 
        preselectedProductId={params.productId} 
        onSubmit={handleSubmit} 
        submitting={submitting} 
      />
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
