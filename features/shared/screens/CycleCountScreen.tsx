import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CardboardHeader from '@/components/CardboardHeader';
import ConfirmModal from '@/features/shared/components/ConfirmModal';
import { getProducts } from '@/services/productService';
import { applyCycleCount } from '@/services/cycleCountService';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types/product';

export default function CycleCountScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const needle = search.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(needle) || product.barcode.includes(search),
    );
  }, [products, search]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;
  const countedValue = parseInt(countedQty, 10);
  const delta = selectedProduct ? countedValue - selectedProduct.stock : 0;

  const handleOpenConfirm = () => {
    if (!selectedProduct) {
      Alert.alert('Missing Product', 'Please select a product to count.');
      return;
    }
    if (Number.isNaN(countedValue) || countedValue < 0) {
      Alert.alert('Invalid Count', 'Enter a valid counted quantity.');
      return;
    }
    if (!user) {
      Alert.alert('Not Authenticated', 'Please log in again.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedProduct || !user) return;
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const result = await applyCycleCount(
        selectedProduct.id,
        countedValue,
        user.id,
        user.name,
        notes.trim() || undefined,
      );
      if (result.delta === 0) {
        Alert.alert('No Change', 'Count matches current stock. No adjustment needed.');
      } else {
        Alert.alert('Cycle Count Saved', 'Stock has been adjusted based on your count.');
      }
      setCountedQty('');
      setNotes('');
      setSelectedProductId('');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save cycle count.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmMessage = selectedProduct
    ? `Counted ${countedValue} units for ${selectedProduct.name}. This will ${delta >= 0 ? 'add' : 'remove'} ${Math.abs(delta)} unit(s) to match the count.`
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2B3A7E" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(true)} />
          }
        >
          <View style={styles.headerCard}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="clipboard-outline" size={24} color="#2B3A7E" />
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerEyebrow}>Inventory Count</Text>
              <Text style={styles.headerTitle}>Cycle Count</Text>
              <Text style={styles.headerSubtitle}>
                Verify physical stock against system records.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Search Products</Text>
              <View style={styles.searchField}>
                <Ionicons name="search-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by name or barcode"
                  placeholderTextColor="#9CA3AF"
                />
                {search.trim().length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Select Product</Text>
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.productChip,
                      selectedProductId === item.id && styles.productChipActive,
                    ]}
                    onPress={() => setSelectedProductId(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.productName,
                        selectedProductId === item.id && styles.productNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.productMeta,
                        selectedProductId === item.id && styles.productMetaActive,
                      ]}
                    >
                      {item.stock} in stock
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {selectedProduct && (
              <View style={styles.stockCard}>
                <View style={styles.stockCardHeader}>
                  <Ionicons name="cube-outline" size={20} color="#2B3A7E" />
                  <Text style={styles.stockLabel}>Current System Stock</Text>
                </View>
                <Text style={styles.stockValue}>{selectedProduct.stock} units</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Counted Quantity</Text>
              <TextInput
                style={styles.countInput}
                value={countedQty}
                onChangeText={setCountedQty}
                keyboardType="numeric"
                placeholder="Enter physical count"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this count"
                placeholderTextColor="#9CA3AF"
                multiline
              />
            </View>

            {selectedProduct && !Number.isNaN(countedValue) && (
              <View style={styles.deltaCard}>
                <View style={styles.deltaHeader}>
                  <Ionicons
                    name={delta === 0 ? 'checkmark-circle' : 'analytics-outline'}
                    size={18}
                    color={delta === 0 ? '#10B981' : '#2B3A7E'}
                  />
                  <Text style={styles.deltaLabel}>Variance Analysis</Text>
                </View>
                <Text style={[styles.deltaValue, delta === 0 && { color: '#10B981' }]}>
                  {delta > 0 ? '+' : ''}
                  {delta} units
                </Text>
                <Text style={styles.deltaHelper}>
                  {delta === 0
                    ? 'Count matches system stock'
                    : delta > 0
                      ? 'Physical count is higher'
                      : 'Physical count is lower'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleOpenConfirm}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitText}>Record Count</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <ConfirmModal
        visible={confirmOpen}
        title="Confirm Cycle Count"
        message={confirmMessage}
        confirmLabel="Apply"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  content: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },
  headerCard: {
    flexDirection: 'row',
    gap: 14,
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
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Poppins_400Regular',
  },
  productList: { paddingVertical: 4, gap: 10 },
  productChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 140,
  },
  productChipActive: {
    backgroundColor: '#2B3A7E',
    borderColor: '#2B3A7E',
  },
  productName: {
    fontSize: 13,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  productNameActive: { color: '#FFFFFF' },
  productMeta: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  productMetaActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  stockCard: {
    backgroundColor: '#EAF1FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  stockCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  stockValue: {
    fontSize: 24,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  countInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'Poppins_400Regular',
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deltaCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EDF9',
  },
  deltaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deltaLabel: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  deltaValue: {
    fontSize: 28,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  deltaHelper: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
  submitBtn: {
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2B3A7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
});
