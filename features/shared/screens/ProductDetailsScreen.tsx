import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { RoleBasedView } from '@/components/RoleBasedView';
import ActivityLogList from '@/features/shared/components/ActivityLogList';
import { getProductById, deleteProduct } from '@/services/productService';
import { getStockMovements } from '@/services/stockMovementService';
import { createRestockRequest } from '@/services/restockRequestService';
import type { Product } from '@/types/product';
import type { StockMovement } from '@/types/stockMovement';
import { formatCurrency } from '@/utils/helpers';
import { useUserRole } from '@/hooks/useUserRole';

type Tab = 'overview' | 'movements';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const productId = useMemo(() => {
    if (!params.id) return '';
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const { isOwner } = useUserRole();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const loadProduct = React.useCallback(() => {
    if (!productId) return;
    getProductById(productId).then(setProduct);
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useFocusEffect(
    React.useCallback(() => {
      loadProduct();
    }, [loadProduct])
  );

  useEffect(() => {
    if (activeTab !== 'movements' || !productId) return;
    setLoadingMovements(true);
    getStockMovements(productId)
      .then(setMovements)
      .finally(() => setLoadingMovements(false));
  }, [activeTab, productId]);

  const lowStockThreshold = product?.minimumStockLevel ?? 5;
  const isLow = product ? product.stock < lowStockThreshold : false;

  const handleAdjust = () => {
    router.push({
      pathname: isOwner ? '/(owner)/stock-adjustment' : '/(staff)/stock-adjustment',
      params: { productId, returnTo: `/product/${productId}` },
    });
  };

  const handleEdit = () => {
    if (!product) return;
    router.push({ pathname: '/(owner)/edit-product', params: { id: product.id, from: 'details' } });
  };

  const handleDelete = () => {
    if (!product) return;
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Success', 'Product deleted successfully.', [
                { text: 'OK', onPress: () => router.push('/(owner)/product-management') },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  const handleRequestRestock = () => {
    if (!product) return;
    router.push({
      pathname: '/(staff)/restock-request',
      params: { productId: product.id, returnTo: `/product/${product.id}` },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Product Details" onBackPress={() => router.back()} />

      {!product ? (
        <View style={styles.center}>
          <ActivityIndicator color="#2B3A7E" />
        </View>
      ) : (
        <>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.iconBadge}>
                <Ionicons name="cube-outline" size={22} color="#2B3A7E" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
              <View style={[styles.stockBadge, isLow && styles.lowStockBadge]}>
                <Text style={styles.stockText}>{product.stock} in stock</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>{formatCurrency(product.price)}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['overview', 'movements'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'overview' ? 'Overview' : 'Movements'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'overview' ? (
            <ScrollView contentContainerStyle={styles.overviewContent}>
              <View style={styles.detailsCard}>
                <Text style={styles.sectionTitle}>Product Details</Text>
                {[
                  { icon: 'barcode-outline' as const, label: 'Barcode', value: product.barcode },
                  { icon: 'layers-outline' as const, label: 'Category', value: product.category },
                  {
                    icon: 'analytics-outline' as const,
                    label: 'Stock Quantity',
                    value: `${product.stock} units`,
                    highlight: isLow,
                  },
                  {
                    icon: 'alert-circle-outline' as const,
                    label: 'Min Stock Level',
                    value: `${lowStockThreshold} units`,
                  },
                ].map((row) => (
                  <View key={row.label} style={styles.detailRow}>
                    <Ionicons name={row.icon} size={18} color="#2B3A7E" />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={[styles.detailValue, row.highlight && styles.lowStock]}>
                        {row.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <TouchableOpacity style={styles.adjustBtn} onPress={handleAdjust}>
                <Ionicons name="swap-vertical-outline" size={20} color="#FFFFFF" />
                <Text style={styles.adjustBtnText}>Adjust Stock</Text>
              </TouchableOpacity>

              <RoleBasedView roles={['owner']}>
                <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                  <Ionicons name="create-outline" size={20} color="#2B3A7E" />
                  <Text style={styles.editBtnText}>Edit Product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                  <Text style={styles.deleteBtnText}>Delete Product</Text>
                </TouchableOpacity>
              </RoleBasedView>

              <RoleBasedView roles={['staff']}>
                {isLow && (
                  <TouchableOpacity style={styles.restockBtn} onPress={handleRequestRestock}>
                    <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.restockBtnText}>Request Restock</Text>
                  </TouchableOpacity>
                )}
              </RoleBasedView>
            </ScrollView>
          ) : (
            <View style={styles.movementsContainer}>
              {loadingMovements ? (
                <View style={styles.center}>
                  <ActivityIndicator color="#2B3A7E" />
                </View>
              ) : (
                <ActivityLogList
                  movements={movements}
                  emptyMessage="No movements recorded for this product."
                />
              )}
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  productName: { fontSize: 18, color: '#1f2937', fontFamily: 'Poppins_700Bold' },
  categoryText: { color: '#6B7280', fontSize: 13, marginTop: 2, fontFamily: 'Poppins_400Regular' },
  stockBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lowStockBadge: { backgroundColor: '#F59E0B' },
  stockText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
  priceRow: {
    marginTop: 14,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  priceLabel: { color: '#6B7280', fontSize: 12, fontFamily: 'Poppins_500Medium' },
  priceValue: { marginTop: 4, fontSize: 20, color: '#2B3A7E', fontFamily: 'Poppins_700Bold' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, color: '#6B7280', fontFamily: 'Poppins_600SemiBold' },
  tabTextActive: { color: '#2B3A7E' },
  overviewContent: { padding: 16, paddingBottom: 100, gap: 12 },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { color: '#111827', fontSize: 15, marginBottom: 12, fontFamily: 'Poppins_600SemiBold' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  detailText: { flex: 1 },
  detailLabel: { color: '#6B7280', fontSize: 11, fontFamily: 'Poppins_500Medium' },
  detailValue: { color: '#111827', fontSize: 14, marginTop: 2, fontFamily: 'Poppins_600SemiBold' },
  lowStock: { color: '#F59E0B' },
  adjustBtn: {
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  editBtn: {
    backgroundColor: '#E6EEFF',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  editBtnText: { color: '#2B3A7E', fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteBtnText: { color: '#DC2626', fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  restockBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restockBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  movementsContainer: { flex: 1, marginTop: 8 },
});
