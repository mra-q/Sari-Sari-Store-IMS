import api from './api';
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

export const getStockInsights = async (period: InsightsPeriod = 'monthly'): Promise<StockInsightsData> => {
  const response = await apiRequest<StockInsightsData>(`/stock/insights/?period=${period}`);
  return response;
};

export const stockInsightsService = {
  getStockInsights,
};
