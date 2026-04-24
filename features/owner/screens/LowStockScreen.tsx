import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CardboardHeader from '@/components/CardboardHeader';
import ProductItem from '@/components/ProductItem';
import { RoleBasedView } from '@/components/RoleBasedView';
import { getLowStockProducts } from '@/services/inventoryService';
import { createRestockRequest } from '@/services/restockRequestService';
import type { Product } from '@/types/product';
import RestockRequestModal from '@/features/shared/components/RestockRequestModal';

export default function LowStockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadLowStockProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const items = await getLowStockProducts();
      setProducts(items);
    } catch {
      Alert.alert('Error', 'Unable to load low stock items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  const criticalCount = useMemo(
    () => products.filter((p) => p.stock === 0).length,
    [products]
  );

  const urgentCount = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= 2).length,
    [products]
  );

  const getStockSeverity = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: '#DC2626', bg: '#FEE2E2' };
    if (stock <= 2) return { label: 'Critical', color: '#EA580C', bg: '#FFF7ED' };
    return { label: 'Low', color: '#D97706', bg: '#FEF3C7' };
  };

  const handleSubmitRequest = async (quantity: number, notes: string) => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await createRestockRequest({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        requestedQty: quantity,
        notes,
      });
      Alert.alert('Request Sent', 'Restock request has been submitted.');
      setSelectedProduct(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Unable to submit restock request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader />

      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <View style={styles.restrictedIconWrap}>
              <Ionicons name="lock-closed-outline" size={32} color="#2B3A7E" />
            </View>
            <Text style={styles.restrictedTitle}>Owner Access Only</Text>
            <Text style={styles.restrictedText}>
              Low stock view is available for store owners only.
            </Text>
          </View>
        }
      >
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadLowStockProducts(true)} />
          }
          ListHeaderComponent={
            <View style={styles.headerContent}>
              <View style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={styles.alertIconWrap}>
                    <Ionicons name="warning-outline" size={24} color="#D97706" />
                  </View>
                  <View style={styles.alertTextBlock}>
                    <Text style={styles.alertEyebrow}>Restock Alert</Text>
                    <Text style={styles.alertTitle}>Low Stock Items</Text>
                    <Text style={styles.alertSubtitle}>
                      Monitor and manage products that need restocking attention.
                    </Text>
                  </View>
                </View>

                <View style={styles.alertStatsRow}>
                  <View style={styles.alertStatCard}>
                    <Text style={styles.alertStatValue}>{products.length}</Text>
                    <Text style={styles.alertStatLabel}>Total Items</Text>
                  </View>
                  <View style={[styles.alertStatCard, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.alertStatValue, { color: '#DC2626' }]}>{criticalCount}</Text>
                    <Text style={styles.alertStatLabel}>Out of Stock</Text>
                  </View>
                  <View style={[styles.alertStatCard, { backgroundColor: '#FFF7ED' }]}>
                    <Text style={[styles.alertStatValue, { color: '#EA580C' }]}>{urgentCount}</Text>
                    <Text style={styles.alertStatLabel}>Critical</Text>
                  </View>
                </View>

                <View style={styles.alertActionsRow}>
                  <TouchableOpacity
                    style={styles.alertPrimaryAction}
                    onPress={() => router.push('/(owner)/restock-requests')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="clipboard-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.alertPrimaryActionText}>Restock Requests</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.alertSecondaryAction}
                    onPress={() => router.push('/(owner)/add-product')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#2B3A7E" />
                    <Text style={styles.alertSecondaryActionText}>Add Product</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Products Needing Attention</Text>
                  <Text style={styles.sectionSubtitle}>
                    {products.length} item{products.length === 1 ? '' : 's'} below minimum stock level
                  </Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const severity = getStockSeverity(item.stock);
            return (
              <View style={styles.productWrapper}>
                <ProductItem
                  product={item}
                  onPress={() => router.push(`/product/${item.id}`)}
                />
                <View style={styles.productActions}>
                  <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
                    <Ionicons name="alert-circle" size={12} color={severity.color} />
                    <Text style={[styles.severityText, { color: severity.color }]}>
                      {severity.label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.requestBtn}
                    onPress={() => setSelectedProduct(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cart-outline" size={14} color="#2B3A7E" />
                    <Text style={styles.requestText}>Restock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#2B3A7E" />
                <Text style={styles.loadingText}>Loading low stock items...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                </View>
                <Text style={styles.emptyTitle}>All Stocked Up!</Text>
                <Text style={styles.emptyText}>
                  No products are currently below minimum stock levels.
                </Text>
              </View>
            )
          }
        />
      </RoleBasedView>

      <RestockRequestModal
        visible={!!selectedProduct}
        product={selectedProduct}
        submitting={submitting}
        onSubmit={handleSubmitRequest}
        onCancel={() => setSelectedProduct(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },
  headerContent: {
    marginBottom: 18,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productWrapper: {
    width: '48.3%',
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  alertIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFF4DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextBlock: {
    flex: 1,
  },
  alertEyebrow: {
    fontSize: 11,
    color: '#D97706',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
    marginTop: 4,
  },
  alertStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  alertStatCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertStatValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  alertStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  alertActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  alertPrimaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingVertical: 12,
  },
  alertPrimaryActionText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  alertSecondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingVertical: 12,
  },
  alertSecondaryActionText: {
    fontSize: 13,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
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
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  severityText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  requestText: {
    color: '#2B3A7E',
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  restrictedIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  restrictedTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
});
