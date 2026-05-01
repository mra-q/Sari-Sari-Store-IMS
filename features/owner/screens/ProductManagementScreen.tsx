import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CardboardHeader from '@/components/CardboardHeader';
import ProductItem from '@/components/ProductItem';
import { getInventorySummary } from '@/services/inventoryService';
import { getProducts } from '@/services/productService';
import type { InventorySummary, Product } from '@/types/product';
import { formatCurrency } from '@/utils/helpers';

export default function ProductManagementScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);

  const loadProducts = async () => {
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
  };

  useEffect(() => {
    loadProducts();
  }, []);

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

  const hasActiveFilters = search.trim().length > 0 || selectedCategory !== 'All';

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader title="Product Management" />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProducts} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroEyebrow}>Catalog overview</Text>
                  <Text style={styles.heroTitle}>Manage your product catalog</Text>
                  <Text style={styles.heroSubtitle}>
                    Review items, open edit flows quickly, and keep pricing and product details clean.
                  </Text>
                </View>

                <View style={styles.heroIconWrap}>
                  <Ionicons name="clipboard-outline" size={24} color="#2B3A7E" />
                </View>
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatCard}>
                  <Text style={styles.heroStatValue}>{summary?.totalProducts ?? products.length}</Text>
                  <Text style={styles.heroStatLabel}>Products</Text>
                </View>
                <View style={styles.heroStatCard}>
                  <Text style={styles.heroStatValue}>{summary?.categorySummary?.length ?? categories.length - 1}</Text>
                  <Text style={styles.heroStatLabel}>Categories</Text>
                </View>
                <View style={styles.heroStatCard}>
                  <Text style={styles.heroStatValue}>{summary?.outOfStockCount ?? 0}</Text>
                  <Text style={styles.heroStatLabel}>Out of Stock</Text>
                </View>
              </View>

              <View style={styles.heroFooter}>
                <View style={styles.heroFooterLeft}>
                  <Text style={styles.heroFooterLabel}>Estimated catalog value</Text>
                  <Text style={styles.heroFooterValue}>
                    {formatCurrency(summary?.estimatedInventoryValue ?? 0)}
                  </Text>
                </View>
                <View style={styles.quickActionRow}>
                  <TouchableOpacity
                    style={styles.primaryQuickAction}
                    onPress={() => router.push('/(owner)/add-product')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add-circle-outline" size={12} color="#FFFFFF" />
                    <Text style={styles.primaryQuickActionText}>Add Product</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryQuickAction}
                    onPress={() => router.push('/(owner)/categories')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="pricetags-outline" size={10} color="#2B3A7E" />
                    <Text style={styles.secondaryQuickActionText}>Categories</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.reviewRow}>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewValue}>{summary?.lowStockCount ?? 0}</Text>
                <Text style={styles.reviewLabel}>Need reorder review</Text>
              </View>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewValue}>{filteredProducts.length}</Text>
                <Text style={styles.reviewLabel}>Visible catalog items</Text>
              </View>
            </View>

            <View style={styles.controlsCard}>
              <View style={styles.controlsHeader}>
                <View>
                  <Text style={styles.controlsTitle}>Catalog Records</Text>
                  <Text style={styles.controlsSubtitle}>
                    Search by name, barcode, or category to find products to edit.
                  </Text>
                </View>

                {hasActiveFilters ? (
                  <TouchableOpacity
                    style={styles.activeFilterBadge}
                    onPress={clearFilters}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.activeFilterText}>Clear filters</Text>
                    <Ionicons name="close" size={14} color="#2B3A7E" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.passiveFilterBadge}>
                    <Ionicons name="document-text-outline" size={14} color="#64748B" />
                    <Text style={styles.passiveFilterText}>Admin view</Text>
                  </View>
                )}
              </View>

              <View style={styles.controlsRow}>
                <View style={styles.searchField}>
                  <Ionicons name="search-outline" size={18} color="#64748B" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by product name or barcode"
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.8}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.filterToggle}
                  onPress={() => setShowCategoryFilter(!showCategoryFilter)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={showCategoryFilter ? 'eye-off-outline' : 'options-outline'}
                    size={16}
                    color="#2B3A7E"
                  />
                  <Text style={styles.filterToggleText}>
                    {showCategoryFilter ? 'Hide' : 'Filter'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.helperRow}>
                <View style={styles.helperPill}>
                  <Ionicons name="create-outline" size={13} color="#64748B" />
                  <Text style={styles.helperPillText}>
                    Tap a row to view details or use Edit for quick catalog updates.
                  </Text>
                </View>
                <View style={styles.helperPill}>
                  <Ionicons name="layers-outline" size={13} color="#64748B" />
                  <Text style={styles.helperPillText}>
                    {selectedCategory !== 'All' ? selectedCategory : 'All categories'}
                  </Text>
                </View>
              </View>
            </View>

            {showCategoryFilter && (
              <View style={styles.filterRow}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterLabel}>Quick Categories</Text>
                  <Text style={styles.filterMeta}>{categories.length - 1} available</Text>
                </View>
                <FlatList
                  data={categories}
                  horizontal
                  keyExtractor={(item) => item}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        selectedCategory === item && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedCategory(item)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedCategory === item && styles.filterChipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const isLowStock = item.stock <= (item.minimumStockLevel ?? 0);
          const statusLabel =
            item.stock <= 0 ? 'Out of stock' : isLowStock ? 'Needs review' : 'In good standing';

          return (
            <TouchableOpacity
              style={styles.managementCard}
              activeOpacity={0.88}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <View style={styles.managementHeader}>
                <View style={styles.managementHeaderText}>
                  <Text style={styles.managementTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.managementMeta} numberOfLines={1}>
                    SKU: {item.sku || 'Not set'} • Barcode: {item.barcode || 'N/A'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.managementStatusBadge,
                    isLowStock && styles.managementStatusBadgeWarning,
                    item.stock <= 0 && styles.managementStatusBadgeCritical,
                  ]}
                >
                  <Text
                    style={[
                      styles.managementStatusText,
                      isLowStock && styles.managementStatusTextWarning,
                      item.stock <= 0 && styles.managementStatusTextCritical,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.managementCategoryRow}>
                <View style={styles.managementCategoryChip}>
                  <Ionicons name="pricetag-outline" size={13} color="#2B3A7E" />
                  <Text style={styles.managementCategoryText}>{item.category}</Text>
                </View>
                <Text style={styles.managementUpdatedText}>
                  Reorder at {item.minimumStockLevel ?? 0}
                </Text>
              </View>

              <View style={styles.managementMetricsRow}>
                <View style={styles.managementMetricCard}>
                  <Text style={styles.managementMetricLabel}>Price</Text>
                  <Text style={styles.managementMetricValue}>{formatCurrency(item.price)}</Text>
                </View>
                <View style={styles.managementMetricCard}>
                  <Text style={styles.managementMetricLabel}>Stock</Text>
                  <Text style={styles.managementMetricValue}>{item.stock}</Text>
                </View>
                <View style={styles.managementMetricCard}>
                  <Text style={styles.managementMetricLabel}>Threshold</Text>
                  <Text style={styles.managementMetricValue}>
                    {item.minimumStockLevel ?? 0}
                  </Text>
                </View>
              </View>

              <View style={styles.managementActionsRow}>
                <TouchableOpacity
                  style={styles.managementSecondaryAction}
                  onPress={() => router.push(`/product/${item.id}`)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="eye-outline" size={15} color="#2B3A7E" />
                  <Text style={styles.managementSecondaryActionText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.managementPrimaryAction}
                  onPress={() => router.push(`/(owner)/edit-product?id=${item.id}`)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="create-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.managementPrimaryActionText}>Edit Product</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="clipboard-outline" size={28} color="#2B3A7E" />
            </View>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              Try another keyword or reset the category filter to see more catalog records.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(owner)/add-product')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    marginBottom: 4,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
    marginTop: 6,
    maxWidth: 250,
  },
  heroIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroStatValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  heroFooterLeft: {
    flex: 1,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  reviewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E9EEF7',
  },
  reviewValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  reviewLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  heroFooterLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 4,
  },
  heroFooterValue: {
    fontSize: 16,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 1,
  },
  primaryQuickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2B3A7E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexShrink: 1,
  },
  primaryQuickActionText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  secondaryQuickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF4FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexShrink: 1,
  },
  secondaryQuickActionText: {
    fontSize: 10,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  controlsTitle: {
    fontSize: 17,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  controlsSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
    maxWidth: 200,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF1FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexShrink: 1,
  },
  activeFilterText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  passiveFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexShrink: 1,
  },
  passiveFilterText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchField: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF1FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  filterToggleText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
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
  filterRow: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9EEF7',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  filterMeta: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  filterList: {
    paddingRight: 8,
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2B3A7E',
    borderColor: '#2B3A7E',
  },
  filterChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontFamily: 'Poppins_500Medium',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  managementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  managementHeaderText: {
    flex: 1,
  },
  managementTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  managementMeta: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
  managementStatusBadge: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  managementStatusBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  managementStatusBadgeCritical: {
    backgroundColor: '#FEE2E2',
  },
  managementStatusText: {
    fontSize: 11,
    color: '#166534',
    fontFamily: 'Poppins_600SemiBold',
  },
  managementStatusTextWarning: {
    color: '#B45309',
  },
  managementStatusTextCritical: {
    color: '#B91C1C',
  },
  managementCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  managementCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  managementCategoryText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  managementUpdatedText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  managementMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  managementMetricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  managementMetricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'Poppins_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  managementMetricValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
  },
  managementActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  managementSecondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  managementSecondaryActionText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  managementPrimaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  managementPrimaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 22,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2B3A7E',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
});
