import CardboardHeader from '@/components/CardboardHeader';
import ProductItem from '@/components/ProductItem';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { getInventorySummary } from '@/services/inventoryService';
import { getProducts } from '@/services/productService';
import { createStockMovement } from '@/services/stockMovementService';
import type { InventorySummary, Product } from '@/types/product';
import { formatCurrency } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
  const { canUpdateStock } = usePermissions();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [data, summaryData] = await Promise.all([
        getProducts(),
        getInventorySummary(),
      ]);
      setProducts(data);
      setSummary(summaryData);
    } catch {
      Alert.alert('Error', 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(products.map((product) => product.category)));
    return ['All', ...values];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchMatched =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode.includes(search);

      const categoryMatched =
        selectedCategory === 'All' || product.category === selectedCategory;

      return searchMatched && categoryMatched;
    });
  }, [products, search, selectedCategory]);

  const inventoryRoutePrefix = user?.role === 'owner' ? '/(owner)' : '/(staff)';

  const handleUpdateQuantity = async (product: Product) => {
    if (!user?.id) {
      Alert.alert('Update Failed', 'You must be logged in to update stock.');
      return;
    }

    try {
      const movement = await createStockMovement(
        { productId: product.id, direction: 'in', reason: 'restock', quantity: 1 },
        user.id,
        user.name || 'Unknown',
      );

      setProducts((current) =>
        current.map((item) =>
          item.id === movement.productId ? { ...item, stock: movement.newStock } : item,
        ),
      );
    } catch {
      Alert.alert('Update Failed', 'Unable to update product quantity.');
    }
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
        style={styles.listSurface}
        key="two-columns"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProducts} />
        }
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.workspaceCard}>
              <View style={styles.workspaceHeader}>
                <View style={styles.workspaceTextBlock}>
                  <Text style={styles.workspaceEyebrow}>Inventory workspace</Text>
                  <Text style={styles.workspaceTitle}>Track live stock movement</Text>
                  <Text style={styles.workspaceSubtitle}>
                    Check quantities, monitor low stock items, and keep daily stock updates moving.
                  </Text>
                </View>

                <View style={styles.workspaceIconWrap}>
                  <Ionicons name="layers-outline" size={22} color="#2B3A7E" />
                </View>
              </View>

              <View style={styles.workspaceStatsRow}>
                <View style={styles.workspaceStatCard}>
                  <Text style={styles.workspaceStatValue}>{summary?.totalProducts ?? products.length}</Text>
                  <Text style={styles.workspaceStatLabel}>Products</Text>
                </View>
                <View style={styles.workspaceStatCard}>
                  <Text style={styles.workspaceStatValue}>{summary?.totalStockUnits ?? 0}</Text>
                  <Text style={styles.workspaceStatLabel}>Stock Units</Text>
                </View>
                <View style={styles.workspaceStatCard}>
                  <Text style={styles.workspaceStatValue}>{summary?.lowStockCount ?? 0}</Text>
                  <Text style={styles.workspaceStatLabel}>Low Stock</Text>
                </View>
              </View>

              <View style={styles.workspaceFooter}>
                <View>
                  <Text style={styles.workspaceFooterLabel}>Estimated stock value</Text>
                  <Text style={styles.workspaceFooterValue}>
                    {formatCurrency(summary?.estimatedInventoryValue ?? 0)}
                  </Text>
                </View>

                <View style={styles.workspaceActionRow}>
                  <TouchableOpacity
                    style={styles.workspacePrimaryAction}
                    onPress={() => router.push(`${inventoryRoutePrefix}/stock-adjustment`)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="swap-horizontal-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.workspacePrimaryActionText}>Adjust Stock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.workspaceSecondaryAction}
                    onPress={() => router.push(`${inventoryRoutePrefix}/low-stock`)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="alert-circle-outline" size={15} color="#2B3A7E" />
                    <Text style={styles.workspaceSecondaryActionText}>Low Stock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {user?.role === 'staff' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeadingBlock}>
                    <View style={styles.sectionTitleGroup}>
                      <Ionicons name="flash-outline" size={20} color="#2B3A7E" />
                      <Text style={styles.sectionTitle}>Quick Actions</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>
                      Fast access to your most-used staff tools.
                    </Text>
                  </View>
                </View>

                <View style={styles.staffActionsGrid}>
                  <TouchableOpacity
                    style={styles.staffActionCard}
                    onPress={() => router.push('/(staff)/scan')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionTopRow}>
                      <View style={[styles.actionIconWrap, { backgroundColor: '#E8F1FF' }]}>
                        <Ionicons name="barcode-outline" size={18} color="#2B3A7E" />
                      </View>
                      <View style={styles.actionArrowWrap}>
                        <Ionicons name="arrow-forward" size={14} color="#2B3A7E" />
                      </View>
                    </View>
                    <Text style={styles.actionLabel}>Scan Product</Text>
                    <Text style={styles.actionHelper}>Quick barcode scanning</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.staffActionCard}
                    onPress={() => router.push('/(staff)/activity-log')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionTopRow}>
                      <View style={[styles.actionIconWrap, { backgroundColor: '#E7F6FF' }]}>
                        <Ionicons name="time-outline" size={18} color="#0369A1" />
                      </View>
                      <View style={styles.actionArrowWrap}>
                        <Ionicons name="arrow-forward" size={14} color="#2B3A7E" />
                      </View>
                    </View>
                    <Text style={styles.actionLabel}>My Activity</Text>
                    <Text style={styles.actionHelper}>View your recent actions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.staffActionCard}
                    onPress={() => router.push('/(staff)/cycle-count')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionTopRow}>
                      <View style={[styles.actionIconWrap, { backgroundColor: '#FFF4DB' }]}>
                        <Ionicons name="clipboard-outline" size={18} color="#D97706" />
                      </View>
                      <View style={styles.actionArrowWrap}>
                        <Ionicons name="arrow-forward" size={14} color="#2B3A7E" />
                      </View>
                    </View>
                    <Text style={styles.actionLabel}>Cycle Count</Text>
                    <Text style={styles.actionHelper}>Perform inventory counts</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.staffActionCard}
                    onPress={() => router.push('/(staff)/restock-request')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionTopRow}>
                      <View style={[styles.actionIconWrap, { backgroundColor: '#FEE2E2' }]}>
                        <Ionicons name="add-circle-outline" size={18} color="#DC2626" />
                      </View>
                      <View style={styles.actionArrowWrap}>
                        <Ionicons name="arrow-forward" size={14} color="#2B3A7E" />
                      </View>
                    </View>
                    <Text style={styles.actionLabel}>Request Restock</Text>
                    <Text style={styles.actionHelper}>Submit restock requests</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.resultsCard}>
              <View style={styles.resultsHeader}>
                <View>
                  <Text style={styles.resultsTitle}>Stock On Hand</Text>
                  <Text style={styles.resultsSubtitle}>
                    {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'} shown
                  </Text>
                </View>

                {selectedCategory !== 'All' ? (
                  <TouchableOpacity
                    style={styles.activeFilterBadge}
                    onPress={() => setSelectedCategory('All')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.activeFilterText}>{selectedCategory}</Text>
                    <Ionicons name="close" size={14} color="#2B3A7E" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.allProductsBadge}>
                    <Ionicons name="grid-outline" size={14} color="#64748B" />
                    <Text style={styles.allProductsText}>All categories</Text>
                  </View>
                )}
              </View>

              <View style={styles.inventoryControlsRow}>
                <View style={styles.searchField}>
                  <Ionicons name="search-outline" size={18} color="#64748B" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.trim().length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.8}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.filterShortcut}
                  onPress={() => setShowFilterModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.filterShortcutText}>Filter</Text>
                  <Ionicons name="options-outline" size={14} color="#2B3A7E" />
                </TouchableOpacity>
              </View>

              <View style={styles.helperRow}>
                <View style={styles.helperPill}>
                  <Ionicons name="search-outline" size={14} color="#64748B" />
                  <Text style={styles.helperPillText}>
                    {search.trim().length > 0
                      ? `Searching "${search}"`
                      : 'Search by item name or barcode'}
                  </Text>
                </View>
                <View style={styles.helperPill}>
                  <Ionicons name="cube-outline" size={14} color="#64748B" />
                  <Text style={styles.helperPillText}>
                    {selectedCategory !== 'All'
                      ? selectedCategory
                      : `${products.length} tracked products`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productItemWrapper}>
            <ProductItem
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
              showUpdateButton={canUpdateStock()}
              onUpdateQuantity={handleUpdateQuantity}
            />
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#2B3A7E" />
              <Text style={styles.emptyText}>Loading inventory...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="cube-outline" size={26} color="#2B3A7E" />
              </View>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtext}>
                Try changing the keyword or choosing a different category filter.
              </Text>
            </View>
          )
        }
      />

      <Modal
        transparent
        visible={showFilterModal}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <View>
                <Text style={styles.filterModalTitle}>Filter by Category</Text>
                <Text style={styles.filterModalSubtitle}>
                  Choose one category to narrow the list.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSummaryRow}>
              <View style={styles.filterSummaryCard}>
                <Text style={styles.filterSummaryValue}>{categories.length - 1}</Text>
                <Text style={styles.filterSummaryLabel}>Categories</Text>
              </View>
              <View style={styles.filterSummaryCard}>
                <Text style={styles.filterSummaryValue}>{filteredProducts.length}</Text>
                <Text style={styles.filterSummaryLabel}>Visible Items</Text>
              </View>
            </View>

            <View style={styles.filterModalContent}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => selectCategory(category)}
                  activeOpacity={0.85}
                >
                  <View style={styles.categoryChipTextWrap}>
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.categoryChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                    <Text
                      style={[
                        styles.categoryChipMeta,
                        selectedCategory === category && styles.categoryChipMetaActive,
                      ]}
                    >
                      {category === 'All'
                        ? 'Show every item'
                        : `${products.filter((product) => product.category === category).length} items`}
                    </Text>
                  </View>

                  {selectedCategory === category ? (
                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  listSurface: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },
  headerContent: {
    marginBottom: 18,
  },
  workspaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  workspaceTextBlock: {
    flex: 1,
  },
  workspaceEyebrow: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  workspaceTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  workspaceSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 250,
  },
  workspaceIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  workspaceStatCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  workspaceStatValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  workspaceStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  workspaceFooter: {
    alignItems: 'stretch',
    gap: 12,
    marginTop: 16,
  },
  workspaceFooterLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 4,
  },
  workspaceFooterValue: {
    fontSize: 18,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  workspaceActionRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  workspacePrimaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 0,
  },
  workspacePrimaryActionText: {
    flexShrink: 1,
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  workspaceSecondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 0,
  },
  workspaceSecondaryActionText: {
    flexShrink: 1,
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  inventoryControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchField: {
    flex: 1,
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
  resultsTitle: {
    fontSize: 17,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
  },
  resultsSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6EEFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  allProductsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  allProductsText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helperPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helperPillText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  filterShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterShortcutText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productItemWrapper: {
    width: '48.3%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
    marginTop: 8,
  },
  emptySubtext: {
    marginTop: 4,
    color: '#9CA3AF',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '78%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 12,
    overflow: 'hidden',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  filterModalTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  filterModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filterSummaryCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterSummaryValue: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  filterSummaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  filterModalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#2B3A7E',
    borderColor: '#2B3A7E',
  },
  categoryChipTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  categoryChipText: {
    fontSize: 15,
    color: '#4B5563',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 2,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  categoryChipMeta: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Poppins_400Regular',
  },
  categoryChipMetaActive: {
    color: 'rgba(255,255,255,0.74)',
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 12,
  },
  quickActionsGrid: {
    gap: 10,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionHeadingBlock: {
    flex: 1,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  staffActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  staffActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  actionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionArrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  actionHelper: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
});
