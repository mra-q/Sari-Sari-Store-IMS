import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { getInventorySummary, getLowStockProducts } from '@/services/inventoryService';
import { getStockInsights, type InsightsPeriod } from '@/services/stockInsightsService';
import type { InventorySummary, Product } from '@/types/product';
import { formatCurrency } from '@/utils/helpers';
import CardboardHeader from '@/components/CardboardHeader';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const TWO_COLUMN_CARD_WIDTH = (width - 44) / 2;
const CHART_HEIGHT = 170;
const CHART_WIDTH = Math.max(width - 110, 220);

type DashboardTab = 'movement' | 'product';

type ChartPoint = {
  label: string;
  value: number;
};

type ProductBar = {
  key: string;
  label: string;
  shortLabel: string;
  value: number;
  color: string;
};

const palette = ['#2B3A7E', '#3B82F6', '#60A5FA', '#F59E0B', '#FB923C', '#6366F1'];

const formatAxisValue = (value: number) => {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return `${value}`;
};

const getChartTicks = (maxValue: number) => {
  const safeMax = Math.max(maxValue, 4);
  return Array.from({ length: 5 }, (_, index) =>
    Math.round((safeMax * (4 - index)) / 4),
  );
};

const buildLinePath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) {
    return '';
  }

  return points.reduce(
    (path, point, index) =>
      `${path}${index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`}`,
    '',
  );
};

const getStockSeverity = (stock: number) => {
  if (stock <= 0) {
    return {
      label: 'Critical',
      backgroundColor: '#FEE2E2',
      textColor: '#B91C1C',
    };
  }

  if (stock <= 2) {
    return {
      label: 'Urgent',
      backgroundColor: '#FFF1E6',
      textColor: '#C2410C',
    };
  }

  return {
    label: 'Monitor',
    backgroundColor: '#FEF3C7',
    textColor: '#B45309',
  };
};

function LineInsightsChart({ data }: { data: ChartPoint[] }) {
  const chartMax = Math.max(...data.map((item) => item.value), 4);
  const ticks = getChartTicks(chartMax);
  const points = data.map((item, index) => {
    const denominator = Math.max(data.length - 1, 1);
    const x = (CHART_WIDTH / denominator) * index;
    const y = CHART_HEIGHT - (item.value / chartMax) * (CHART_HEIGHT - 12) - 6;
    return { x, y };
  });
  const linePath = buildLinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${CHART_HEIGHT} L ${
    points[0]?.x ?? 0
  } ${CHART_HEIGHT} Z`;

  return (
    <View style={styles.chartShell}>
      <View style={styles.yAxisColumn}>
        {ticks.map((tick) => (
          <Text key={tick} style={styles.axisLabel}>
            {formatAxisValue(tick)}
          </Text>
        ))}
      </View>

      <View style={styles.plotWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <SvgLinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FB923C" stopOpacity="0.24" />
              <Stop offset="100%" stopColor="#FB923C" stopOpacity="0.02" />
            </SvgLinearGradient>
          </Defs>

          {ticks.map((_, index) => {
            const y = (CHART_HEIGHT / 4) * index;
            return (
              <Line
                key={`grid-${index}`}
                x1="0"
                y1={y}
                x2={CHART_WIDTH}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}

          <Path d={areaPath} fill="url(#lineFill)" />
          <Path d={linePath} stroke="#FB923C" strokeWidth="3" fill="none" />

          {points.map((point, index) => (
            <Circle
              key={`point-${data[index]?.label}`}
              cx={point.x}
              cy={point.y}
              r={index === points.length - 1 ? 4.5 : 3}
              fill="#FFFFFF"
              stroke="#FB923C"
              strokeWidth="2"
            />
          ))}
        </Svg>

        <View style={styles.xAxisRow}>
          {data.map((item) => (
            <Text key={item.label} style={styles.xAxisLabel}>
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function BarInsightsChart({ data }: { data: ProductBar[] }) {
  const chartMax = Math.max(...data.map((item) => item.value), 4);
  const ticks = getChartTicks(chartMax);

  return (
    <>
      <View style={styles.chartShell}>
        <View style={styles.yAxisColumn}>
          {ticks.map((tick) => (
            <Text key={tick} style={styles.axisLabel}>
              {formatAxisValue(tick)}
            </Text>
          ))}
        </View>

        <View style={styles.barPlotWrapper}>
          <View style={styles.barGrid}>
            {ticks.map((_, index) => (
              <View
                key={`bar-grid-${index}`}
                style={[
                  styles.barGridLine,
                  { top: (CHART_HEIGHT / 4) * index },
                ]}
              />
            ))}
          </View>

          <View style={styles.barRow}>
            {data.map((item) => {
              const fillHeight = Math.max(
                14,
                (item.value / chartMax) * (CHART_HEIGHT - 12),
              );

              return (
                <View key={item.key} style={styles.barItem}>
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={[item.color, '#FB923C']}
                      start={{ x: 0.5, y: 1 }}
                      end={{ x: 0.5, y: 0 }}
                      style={[styles.barFill, { height: fillHeight }]}
                    />
                  </View>
                  <Text style={styles.barItemLabel}>{item.shortLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.legendRow}>
        {data.map((item) => (
          <View key={`legend-${item.key}`} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('movement');
  const [period, setPeriod] = useState<InsightsPeriod>('monthly');
  const [stockOutData, setStockOutData] = useState<ChartPoint[]>([]);
  const [productData, setProductData] = useState<ProductBar[]>([]);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [summaryData, lowStockData, insightsData] = await Promise.all([
        getInventorySummary(),
        getLowStockProducts(),
        getStockInsights(period),
      ]);

      setSummary(summaryData);
      setLowStockProducts(lowStockData);
      
      // Set stock-out data with fallback
      setStockOutData((insightsData.stockOut || []).map(item => ({
        label: item.label,
        value: item.value,
      })));
      
      // Set product data with fallback
      const products = insightsData.products || [];
      if (products.length > 0) {
        setProductData(products.map((item, index) => ({
          key: item.category,
          label: item.category,
          shortLabel: item.category.length > 5 ? `${item.category.slice(0, 5)}.` : item.category,
          value: item.value,
          color: palette[index % palette.length],
        })));
      } else {
        // Fallback data if no products
        setProductData([
          { key: 'p1', label: 'No Data', shortLabel: 'N/A', value: 1, color: palette[0] },
        ]);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const storeName = user?.storeName || user?.store_name || 'Your Store';
  const lastUpdatedLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'weekly': return 'Weekly';
      case 'annual': return 'Annual';
      default: return 'Monthly';
    }
  }, [period]);

  const recentStockOutTotal = useMemo(
    () => stockOutData.reduce((sum, item) => sum + item.value, 0),
    [stockOutData],
  );

  const peakMovementMonth = useMemo(
    () =>
      stockOutData.reduce(
        (best, item) => (item.value > best.value ? item : best),
        stockOutData[0] ?? { label: 'N/A', value: 0 },
      ),
    [stockOutData],
  );

  const topProductCategory = productData[0];

  const periodOptions: { value: InsightsPeriod; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ];

  const heroHighlights = useMemo(
    () => [
      {
        label: 'Products',
        value: `${summary?.totalProducts ?? 0}`,
      },
      {
        label: 'Categories',
        value: `${summary?.categorySummary?.length ?? 0}`,
      },
      {
        label: 'Added Today',
        value: `${summary?.stockAddedToday ?? 0}`,
      },
    ],
    [summary],
  );

  const quickActions = useMemo(
    () => [
      {
        label: 'Add Product',
        description: 'Create a new item in your catalog',
        icon: 'add-circle-outline',
        route: '/(owner)/add-product',
        tint: '#E8F1FF',
        iconColor: '#2B3A7E',
      },
      {
        label: 'Adjust Stock',
        description: 'Update quantities in a few taps',
        icon: 'swap-vertical-outline',
        route: '/(owner)/stock-adjustment',
        tint: '#E7F6FF',
        iconColor: '#0369A1',
      },
      {
        label: 'Low Stock',
        description: 'Check items that need restocking',
        icon: 'alert-circle-outline',
        route: '/(owner)/low-stock',
        tint: '#FFF4DB',
        iconColor: '#D97706',
      },
    ],
    [],
  );



  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CardboardHeader showGreeting={true} storeName={storeName} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color="#2B3A7E" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBlock}>
            <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <LinearGradient
                colors={['#4A90FF', '#2B3A7E', '#082562']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroGlowTop} />
                <View style={styles.heroGlowBottom} />

                <View style={styles.heroTopRow}>
                  <View style={styles.heroTextBlock}>
                    <Text style={styles.heroEyebrow}>Inventory amount</Text>
                    <Text style={styles.heroValue}>
                      {formatCurrency(summary?.estimatedInventoryValue ?? 0)}
                    </Text>
                    <Text style={styles.heroSupportingText}>
                      Keep an eye on store health, movement trends, and product mix in one view.
                    </Text>
                  </View>

                  <View style={styles.heroInventoryBadge}>
                    <Ionicons name="cube-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.heroInventoryBadgeText}>
                      {summary?.totalProducts ?? 0} items
                    </Text>
                  </View>
                </View>

                <View style={styles.heroMetaRow}>
                  <View style={styles.heroStatusPill}>
                    <Ionicons name="pulse-outline" size={14} color="#2B3A7E" />
                    <Text style={styles.heroStatusPillText}>
                      {summary?.lowStockCount ?? 0} restock alerts
                    </Text>
                  </View>
                  <Text style={styles.heroMetaText}>Updated {lastUpdatedLabel}</Text>
                </View>

                <View style={styles.heroHighlightRow}>
                  {heroHighlights.map((item) => (
                    <View key={item.label} style={styles.heroHighlightCard}>
                      <Text style={styles.heroHighlightValue}>{item.value}</Text>
                      <Text style={styles.heroHighlightLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>

            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeTab === 'movement' && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveTab('movement')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    activeTab === 'movement' && styles.segmentButtonTextActive,
                  ]}
                >
                  Movement
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeTab === 'product' && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveTab('product')}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    activeTab === 'product' && styles.segmentButtonTextActive,
                  ]}
                >
                  Product
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.insightsCard}>
              <View style={styles.insightsHeader}>
                <View style={styles.insightsHeadingBlock}>
                  <View style={styles.insightsBadge}>
                    <Text style={styles.insightsBadgeText}>
                      {activeTab === 'movement' ? 'TREND' : 'OVERVIEW'}
                    </Text>
                  </View>
                  <Text style={styles.insightsTitle}>
                    {activeTab === 'movement' ? 'Stock Movement Trends' : 'Product Category'}
                  </Text>
                  <Text style={styles.insightsDescription}>
                    {activeTab === 'movement'
                      ? `Track ${periodLabel.toLowerCase()} stock-out trends and patterns.`
                      : `Top categories by movement in the ${periodLabel.toLowerCase()} period.`}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.insightsFilter}
                  onPress={() => setShowPeriodDropdown(true)}
                >
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.insightsFilterText}>{periodLabel}</Text>
                  <Ionicons name="chevron-down" size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {activeTab === 'movement' ? (
                <LineInsightsChart data={stockOutData} />
              ) : (
                <BarInsightsChart data={productData} />
              )}

              <View style={styles.insightsSummaryRow}>
                {activeTab === 'movement' ? (
                  <>
                    <View style={styles.insightsSummaryCard}>
                      <Text style={styles.insightsSummaryLabel}>Total moved out</Text>
                      <Text style={styles.insightsSummaryValue}>{recentStockOutTotal}</Text>
                    </View>
                    <View style={styles.insightsSummaryCard}>
                      <Text style={styles.insightsSummaryLabel}>Peak movement</Text>
                      <Text style={styles.insightsSummaryValue}>{peakMovementMonth.label}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.insightsSummaryCard}>
                      <Text style={styles.insightsSummaryLabel}>Top category</Text>
                      <Text style={styles.insightsSummaryValue}>
                        {topProductCategory?.label ?? 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.insightsSummaryCard}>
                      <Text style={styles.insightsSummaryLabel}>Total moved</Text>
                      <Text style={styles.insightsSummaryValue}>
                        {productData.reduce((sum, item) => sum + item.value, 0)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeadingBlock}>
                  <View style={styles.sectionTitleGroup}>
                    <Ionicons name="flash-outline" size={20} color="#2B3A7E" />
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    Larger shortcuts for the tasks owners use most often.
                  </Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    style={styles.actionCard}
                    onPress={() => router.push(action.route as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionTopRow}>
                      <View style={[styles.actionIconWrap, { backgroundColor: action.tint }]}>
                        <Ionicons name={action.icon as any} size={24} color={action.iconColor} />
                      </View>
                      <View style={styles.actionArrowWrap}>
                        <Ionicons name="arrow-forward" size={16} color="#2B3A7E" />
                      </View>
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Text style={styles.actionHelper}>{action.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {lowStockProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeadingBlock}>
                    <View style={styles.sectionTitleGroup}>
                      <Ionicons name="warning-outline" size={20} color="#D97706" />
                      <Text style={styles.sectionTitle}>Restock Watchlist</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>
                      Prioritize the items that need attention first.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.push('/(owner)/low-stock')}
                    style={styles.sectionLink}
                  >
                    <Text style={styles.sectionLinkText}>View all</Text>
                    <Ionicons name="chevron-forward" size={16} color="#2B3A7E" />
                  </TouchableOpacity>
                </View>

                <View style={styles.watchlistContainer}>
                  {lowStockProducts.slice(0, 3).map((product) => {
                    const severity = getStockSeverity(product.stock);

                    return (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.watchlistItem}
                        onPress={() => router.push(`/product/${product.id}`)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.watchlistMain}>
                          <View style={styles.watchlistIcon}>
                            <Ionicons name="cube-outline" size={18} color="#D97706" />
                          </View>
                          <View style={styles.watchlistInfo}>
                            <Text style={styles.watchlistName} numberOfLines={1}>
                              {product.name}
                            </Text>
                            <View style={styles.watchlistMetaRow}>
                              <View style={styles.watchlistCategoryChip}>
                                <Text style={styles.watchlistCategory} numberOfLines={1}>
                                  {product.category}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.watchlistSeverityChip,
                                  { backgroundColor: severity.backgroundColor },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.watchlistSeverityText,
                                    { color: severity.textColor },
                                  ]}
                                >
                                  {severity.label}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        <View style={styles.watchlistStockBadge}>
                          <Text style={styles.watchlistStockValue}>{product.stock}</Text>
                          <Text style={styles.watchlistStockLabel}>left</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showPeriodDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPeriodDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPeriodDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  period === option.value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setPeriod(option.value);
                  setShowPeriodDropdown(false);
                }}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={18} 
                  color={period === option.value ? '#2B3A7E' : '#6B7280'} 
                />
                <Text style={[
                  styles.dropdownItemText,
                  period === option.value && styles.dropdownItemTextActive,
                ]}>
                  {option.label}
                </Text>
                {period === option.value && (
                  <Ionicons name="checkmark" size={20} color="#2B3A7E" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },
  loadingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  errorBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    color: '#DC2626',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins_400Regular',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B3A7E',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  heroCard: {
    marginBottom: 16,
  },
  heroGradient: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#23356B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  heroGlowTop: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: -60,
    right: -30,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: -55,
    left: -40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 40,
  },
  heroSupportingText: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Poppins_400Regular',
    marginTop: 10,
    maxWidth: 220,
  },
  heroInventoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroInventoryBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  heroStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroStatusPillText: {
    fontSize: 11,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  heroMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Poppins_500Medium',
  },
  heroHighlightRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroHighlightCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  heroHighlightValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  heroHighlightLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.76)',
    fontFamily: 'Poppins_500Medium',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E9EEF9',
    borderRadius: 18,
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  segmentButtonActive: {
    backgroundColor: '#2B3A7E',
    shadowColor: '#2B3A7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  segmentButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins_600SemiBold',
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  insightsHeadingBlock: {
    flex: 1,
  },
  insightsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F1FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },
  insightsBadgeText: {
    fontSize: 10,
    color: '#2B3A7E',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  insightsTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins_600SemiBold',
  },
  insightsDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
    maxWidth: 230,
  },
  insightsFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  insightsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  insightsFilterText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: 'Poppins_500Medium',
  },
  insightsHint: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
  },
  insightsSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  insightsSummaryCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  insightsSummaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 4,
  },
  insightsSummaryValue: {
    fontSize: 16,
    color: '#0F172A',
    fontFamily: 'Poppins_700Bold',
  },
  chartShell: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  yAxisColumn: {
    height: CHART_HEIGHT + 12,
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  axisLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Poppins_500Medium',
  },
  plotWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  xAxisRow: {
    width: CHART_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
  barPlotWrapper: {
    flex: 1,
    height: CHART_HEIGHT + 24,
    justifyContent: 'flex-end',
  },
  barGrid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: CHART_HEIGHT,
  },
  barGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  barRow: {
    height: CHART_HEIGHT + 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
  },
  barItem: {
    alignItems: 'center',
    gap: 8,
  },
  barTrack: {
    width: 22,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
  },
  barItemLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Poppins_500Medium',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '46%',
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendLabel: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'Poppins_500Medium',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
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
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionLinkText: {
    fontSize: 13,
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  metricCard: {
    width: TWO_COLUMN_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  metricAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    color: '#0F172A',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 32,
    marginBottom: 6,
  },
  metricHelper: {
    fontSize: 11,
    color: '#2563EB',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 14,
  },
  metricFooter: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'Poppins_400Regular',
  },
  actionCard: {
    width: TWO_COLUMN_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
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
    marginBottom: 14,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionArrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  actionHelper: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
  watchlistContainer: {
    gap: 10,
  },
  watchlistItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  watchlistMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  watchlistIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF4DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  watchlistCategory: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins_400Regular',
  },
  watchlistMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  watchlistCategoryChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  watchlistSeverityChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  watchlistSeverityText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  watchlistStockBadge: {
    minWidth: 56,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
  },
  watchlistStockValue: {
    fontSize: 18,
    color: '#C2410C',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 22,
  },
  watchlistStockLabel: {
    fontSize: 10,
    color: '#EA580C',
    fontFamily: 'Poppins_500Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#F8FAFF',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Poppins_500Medium',
  },
  dropdownItemTextActive: {
    color: '#2B3A7E',
    fontFamily: 'Poppins_600SemiBold',
  },
});
