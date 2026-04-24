import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CardboardHeader from '@/components/CardboardHeader';
import { RoleBasedView } from '@/components/RoleBasedView';
import { getInventorySummary, getLowStockProducts } from '@/services/inventoryService';
import type { InventorySummary, Product } from '@/types/product';
import AnalyticsCard from '@/components/ui/AnalyticsCard';
import ChartCard from '@/components/ui/ChartCard';
import { BarChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/helpers';

export default function ReportsScreen() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 64, 420);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [summaryData, lowStockData] = await Promise.all([
          getInventorySummary(),
          getLowStockProducts(),
        ]);

        setSummary(summaryData);
        setLowStockProducts(lowStockData);
      } catch {
        setError('Unable to load report data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const categoryChartData = useMemo(() => {
    return {
      labels: summary?.categorySummary.map((item) => item.category) ?? [],
      datasets: [{ data: summary?.categorySummary.map((item) => item.count) ?? [] }],
    };
  }, [summary]);

  const totalCategories = summary?.categorySummary.length ?? 0;
  const inventoryValue = summary?.estimatedInventoryValue ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader title="Reports" />

      <RoleBasedView
        roles={['owner']}
        fallback={
          <View style={styles.restrictedContainer}>
            <Text style={styles.restrictedText}>Reports are available for store owners only.</Text>
          </View>
        }
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color="#2B3A7E" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroCard}>
                <View style={styles.heroGlow} />
                <View style={styles.heroHeader}>
                  <View style={styles.heroTextBlock}>
                    <Text style={styles.heroEyebrow}>Reporting overview</Text>
                    <Text style={styles.heroTitle}>Keep an eye on inventory health</Text>
                    <Text style={styles.heroSubtitle}>
                      Review product mix, category spread, and low stock risk in one place.
                    </Text>
                  </View>

                  <View style={styles.heroIconWrap}>
                    <Ionicons name="bar-chart-outline" size={24} color="#2B3A7E" />
                  </View>
                </View>

                <View style={styles.heroBadgeRow}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="warning-outline" size={13} color="#2B3A7E" />
                    <Text style={styles.heroBadgeText}>
                      {summary?.lowStockCount ?? 0} items need attention
                    </Text>
                  </View>
                  <View style={styles.heroBadge}>
                    <Ionicons name="layers-outline" size={13} color="#2B3A7E" />
                    <Text style={styles.heroBadgeText}>{totalCategories} categories tracked</Text>
                  </View>
                </View>

                <View style={styles.heroFooter}>
                  <View>
                    <Text style={styles.heroFooterLabel}>Estimated inventory value</Text>
                    <Text style={styles.heroFooterValue}>{formatCurrency(inventoryValue)}</Text>
                  </View>

                  <View style={styles.heroInsightCard}>
                    <Text style={styles.heroInsightValue}>{summary?.totalStockUnits ?? 0}</Text>
                    <Text style={styles.heroInsightLabel}>Units on hand</Text>
                  </View>
                </View>
              </View>

              <View style={styles.snapshotCard}>
                <View style={styles.snapshotHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Snapshot</Text>
                    <Text style={styles.sectionSubtitle}>
                      Quick highlights from your current inventory report.
                    </Text>
                  </View>
                </View>

                <View style={styles.snapshotRow}>
                  <View style={styles.snapshotItem}>
                    <View style={styles.snapshotIconWrap}>
                      <Ionicons name="cube-outline" size={16} color="#2B3A7E" />
                    </View>
                    <Text style={styles.snapshotValue}>{summary?.totalProducts ?? 0}</Text>
                    <Text style={styles.snapshotLabel}>Products</Text>
                  </View>
                  <View style={styles.snapshotItem}>
                    <View style={styles.snapshotIconWrap}>
                      <Ionicons name="arrow-up-circle-outline" size={16} color="#10B981" />
                    </View>
                    <Text style={styles.snapshotValue}>{summary?.stockAddedToday ?? 0}</Text>
                    <Text style={styles.snapshotLabel}>Added Today</Text>
                  </View>
                  <View style={styles.snapshotItem}>
                    <View style={styles.snapshotIconWrap}>
                      <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
                    </View>
                    <Text style={styles.snapshotValue}>{summary?.lowStockCount ?? 0}</Text>
                    <Text style={styles.snapshotLabel}>Low Stock</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <AnalyticsCard
                  title="Total Products"
                  value={String(summary?.totalProducts ?? 0)}
                  icon="cube-outline"
                />
                <AnalyticsCard
                  title="Low Stock"
                  value={String(summary?.lowStockCount ?? 0)}
                  icon="alert-circle-outline"
                  accentColor="#F59E0B"
                />
              </View>

              <View style={styles.metricsRow}>
                <AnalyticsCard
                  title="Stock Added Today"
                  value={String(summary?.stockAddedToday ?? 0)}
                  icon="add-circle-outline"
                  accentColor="#10B981"
                />
                <AnalyticsCard
                  title="Categories"
                  value={String(summary?.categorySummary.length ?? 0)}
                  icon="layers-outline"
                  accentColor="#6366F1"
                />
              </View>

              <View style={styles.chartShell}>
                <ChartCard title="Category Distribution" subtitle="Products by category">
                  {categoryChartData.labels.length === 0 ? (
                    <Text style={styles.emptyText}>No category data available.</Text>
                  ) : (
                    <BarChart
                      data={categoryChartData}
                      width={chartWidth}
                      height={220}
                      fromZero
                      showValuesOnTopOfBars
                      yAxisLabel=""
                      chartConfig={{
                        backgroundColor: '#FFFFFF',
                        backgroundGradientFrom: '#FFFFFF',
                        backgroundGradientTo: '#FFFFFF',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(43,58,126, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(55,65,81, ${opacity})`,
                        propsForBackgroundLines: { stroke: '#E5E7EB' },
                        propsForLabels: { fontSize: 10 },
                        fillShadowGradientFrom: '#2B3A7E',
                        fillShadowGradientTo: '#60A5FA',
                        fillShadowGradientFromOpacity: 1,
                        fillShadowGradientToOpacity: 0.8,
                        style: { borderRadius: 16 },
                      }}
                      style={{ borderRadius: 16 }}
                    />
                  )}
                </ChartCard>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Low Stock Summary</Text>
                    <Text style={styles.sectionSubtitle}>
                      Products that may need reorder or review soon.
                    </Text>
                  </View>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>{lowStockProducts.length}</Text>
                  </View>
                </View>
                {lowStockProducts.length === 0 ? (
                  <Text style={styles.emptyText}>No low stock products.</Text>
                ) : (
                  lowStockProducts.map((product) => (
                    <View key={product.id} style={styles.listCard}>
                      <View style={styles.listLeading}>
                        <View style={styles.listIconWrap}>
                          <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
                        </View>
                        <View style={styles.listTextWrap}>
                          <Text style={styles.itemName}>{product.name}</Text>
                          <Text style={styles.itemMeta}>
                            Threshold: {product.minimumStockLevel ?? 0} units
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.stockBadge,
                          product.stock <= 0 && styles.stockBadgeCritical,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockBadgeText,
                            product.stock <= 0 && styles.stockBadgeTextCritical,
                          ]}
                        >
                          {product.stock} left
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Category Summary</Text>
                    <Text style={styles.sectionSubtitle}>
                      A quick breakdown of how products are distributed.
                    </Text>
                  </View>
                </View>
                {summary?.categorySummary.map((item) => {
                  const maxCount = Math.max(
                    ...(summary?.categorySummary.map((entry) => entry.count) ?? [1]),
                  );
                  const barWidth = `${Math.max((item.count / maxCount) * 100, 12)}%`;

                  return (
                    <View key={item.category} style={styles.categorySummaryCard}>
                      <View style={styles.categorySummaryTop}>
                        <Text style={styles.itemName}>{item.category}</Text>
                        <Text style={styles.itemValue}>{item.count} products</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: barWidth }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </RoleBasedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EDF9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: 'rgba(43,58,126,0.08)',
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
    maxWidth: 260,
  },
  heroIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  heroFooterLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 4,
  },
  heroFooterValue: {
    fontSize: 18,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  heroInsightCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 112,
  },
  heroInsightValue: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  heroInsightLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginTop: 2,
    textAlign: 'right',
  },
  snapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9EEF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  snapshotHeader: {
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
    lineHeight: 18,
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 10,
  },
  snapshotItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  snapshotIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  snapshotValue: {
    fontSize: 20,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  snapshotLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  chartShell: {
    marginBottom: 12,
  },
  section: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: '#1F2937',
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  sectionBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  sectionBadgeText: {
    fontSize: 12,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemName: {
    color: '#374151',
    fontFamily: 'Poppins_500Medium',
  },
  itemValue: {
    color: '#1F2937',
    fontFamily: 'Poppins_600SemiBold',
  },
  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  listLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  listIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextWrap: {
    flex: 1,
  },
  itemMeta: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  stockBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stockBadgeCritical: {
    backgroundColor: '#FEE2E2',
  },
  stockBadgeText: {
    fontSize: 11,
    color: '#B45309',
    fontFamily: 'Poppins_600SemiBold',
  },
  stockBadgeTextCritical: {
    color: '#B91C1C',
  },
  categorySummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  categorySummaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2B3A7E',
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  loadingBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
  errorBlock: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  restrictedText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
});
