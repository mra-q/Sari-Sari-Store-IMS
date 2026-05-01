import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '@/services/productService';
import type { Product } from '@/types/product';
import type { MovementReason, MovementDirection } from '@/types/stockMovement';
import { MOVEMENT_REASON_LABELS, MOVEMENT_REASON_DIRECTIONS } from '@/types/stockMovement';

const OUT_REASONS: MovementReason[] = ['sale', 'damage', 'theft', 'misc'];
const IN_REASONS: MovementReason[] = ['restock', 'return', 'adjustment', 'misc'];

interface StockAdjustmentFormProps {
  preselectedProductId?: string;
  onSubmit: (
    productId: string,
    direction: MovementDirection,
    reason: MovementReason,
    quantity: number,
    notes: string,
  ) => Promise<void>;
  submitting: boolean;
}

export default function StockAdjustmentForm({
  preselectedProductId,
  onSubmit,
  submitting,
}: StockAdjustmentFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId ?? '');
  const [direction, setDirection] = useState<MovementDirection>('out');
  const [reason, setReason] = useState<MovementReason>('sale');
  const [quantityText, setQuantityText] = useState('1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const reasons = direction === 'out' ? OUT_REASONS : IN_REASONS;
  const filteredProducts = preselectedProductId 
    ? products.filter((p) => p.id === preselectedProductId)
    : products;
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const quantity = parseInt(quantityText, 10);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    // Reset reason when direction changes
    setReason(direction === 'out' ? 'sale' : 'restock');
  }, [direction]);

  const validate = (): boolean => {
    if (!selectedProductId) { setError('Please select a product.'); return false; }
    if (!quantity || quantity <= 0) { setError('Quantity must be greater than 0.'); return false; }
    if (direction === 'out' && selectedProduct && quantity > selectedProduct.stock) {
      setError(`Cannot remove ${quantity} units. Only ${selectedProduct.stock} in stock.`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(selectedProductId, direction, reason, quantity, notes);
  };

  if (loadingProducts) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2B3A7E" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Direction Toggle */}
      <Text style={styles.label}>Movement Type</Text>
      <View style={styles.toggleRow}>
        {(['out', 'in'] as MovementDirection[]).map((dir) => (
          <TouchableOpacity
            key={dir}
            style={[styles.toggleBtn, direction === dir && (dir === 'out' ? styles.toggleOutActive : styles.toggleInActive)]}
            onPress={() => setDirection(dir)}
          >
            <Ionicons
              name={dir === 'out' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
              size={18}
              color={direction === dir ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[styles.toggleText, direction === dir && styles.toggleTextActive]}>
              {dir === 'out' ? 'Stock Out' : 'Stock In'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product Selector */}
      <Text style={styles.label}>Product</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
        {filteredProducts.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.productChip, selectedProductId === p.id && styles.productChipActive]}
            onPress={() => setSelectedProductId(p.id)}
          >
            <Text
              style={[styles.productChipText, selectedProductId === p.id && styles.productChipTextActive]}
              numberOfLines={1}
            >
              {p.name}
            </Text>
            <Text style={[styles.productChipStock, selectedProductId === p.id && styles.productChipTextActive]}>
              {p.stock} units
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedProduct && (
        <View style={styles.stockInfo}>
          <Ionicons name="cube-outline" size={16} color="#2B3A7E" />
          <Text style={styles.stockInfoText}>
            Current stock: <Text style={styles.stockInfoBold}>{selectedProduct.stock} units</Text>
          </Text>
        </View>
      )}

      {/* Reason */}
      <Text style={styles.label}>Reason</Text>
      <View style={styles.reasonGrid}>
        {reasons.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.reasonChip, reason === r && styles.reasonChipActive]}
            onPress={() => setReason(r)}
          >
            <Text style={[styles.reasonChipText, reason === r && styles.reasonChipTextActive]}>
              {MOVEMENT_REASON_LABELS[r]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quantity */}
      <Text style={styles.label}>Quantity</Text>
      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantityText(String(Math.max(1, (parseInt(quantityText, 10) || 1) - 1)))}
        >
          <Ionicons name="remove" size={20} color="#2B3A7E" />
        </TouchableOpacity>
        <TextInput
          style={styles.qtyInput}
          value={quantityText}
          onChangeText={setQuantityText}
          keyboardType="numeric"
          textAlign="center"
        />
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantityText(String((parseInt(quantityText, 10) || 0) + 1))}
        >
          <Ionicons name="add" size={20} color="#2B3A7E" />
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add a note..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={3}
      />

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.submitText}>Apply Adjustment</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 8,
    marginBottom: 6,
  },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleOutActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  toggleInActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  toggleText: { fontSize: 14, color: '#6B7280', fontFamily: 'Poppins_600SemiBold' },
  toggleTextActive: { color: '#FFFFFF' },
  productScroll: { marginBottom: 4 },
  productChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    minWidth: 120,
  },
  productChipActive: { backgroundColor: '#2B3A7E', borderColor: '#2B3A7E' },
  productChipText: { fontSize: 13, color: '#374151', fontFamily: 'Poppins_600SemiBold' },
  productChipTextActive: { color: '#FFFFFF' },
  productChipStock: { fontSize: 11, color: '#6B7280', fontFamily: 'Poppins_400Regular', marginTop: 2 },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6EEFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockInfoText: { fontSize: 13, color: '#374151', fontFamily: 'Poppins_400Regular' },
  stockInfoBold: { fontFamily: 'Poppins_700Bold', color: '#2B3A7E' },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reasonChipActive: { backgroundColor: '#2B3A7E', borderColor: '#2B3A7E' },
  reasonChipText: { fontSize: 13, color: '#374151', fontFamily: 'Poppins_500Medium' },
  reasonChipTextActive: { color: '#FFFFFF' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', fontFamily: 'Poppins_500Medium' },
  submitBtn: {
    marginTop: 8,
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
});
