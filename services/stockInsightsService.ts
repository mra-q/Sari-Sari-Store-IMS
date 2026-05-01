import { apiRequest } from './api';

export type InsightsPeriod = 'weekly' | 'monthly' | 'annual';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ProductCategoryData {
  category: string;
  value: number;
}

export interface StockInsightsData {
  stockOut: ChartDataPoint[];
  products: ProductCategoryData[];
}

export interface InsightsFilter {
  period: InsightsPeriod;
  year?: number;
  month?: number;
  week?: number;
}

export const getStockInsights = async (filter: InsightsFilter): Promise<StockInsightsData> => {
  const params = new URLSearchParams({ period: filter.period });
  if (filter.year) params.append('year', filter.year.toString());
  if (filter.month) params.append('month', filter.month.toString());
  if (filter.week) params.append('week', filter.week.toString());
  
  const response = await apiRequest<StockInsightsData>(`/stock/insights/?${params.toString()}`);
  return response;
};

export const stockInsightsService = {
  getStockInsights,
};
