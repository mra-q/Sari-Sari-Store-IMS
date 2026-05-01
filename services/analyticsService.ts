import { apiRequest } from './api';

export type AnalyticsPeriod = 'weekly' | 'monthly' | 'annual';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ProductCategoryData {
  category: string;
  value: number;
}

export interface AnalyticsData {
  stockOut: ChartDataPoint[];
  products: ProductCategoryData[];
}

export const getAnalytics = async (period: AnalyticsPeriod = 'monthly'): Promise<AnalyticsData> => {
  const response = await apiRequest<AnalyticsData>(`/stock/analytics/?period=${period}`);
  return response;
};

export const analyticsService = {
  getAnalytics,
};
