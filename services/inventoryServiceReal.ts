import apiClient from './apiClient';

export interface InventoryItem {
  id: number;
  product: any;
  quantity: number;
  last_updated: string;
}

export interface InventorySummary {
  total_products: number;
  total_value: number;
  low_stock_count: number;
}

export const inventoryServiceReal = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/inventory/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/inventory/${id}/`);
    return response.data;
  },

  getSummary: async (): Promise<InventorySummary> => {
    const response = await apiClient.get('/inventory/summary/');
    return response.data;
  },

  update: async (id: number, quantity: number) => {
    const response = await apiClient.patch(`/inventory/${id}/`, { quantity });
    return response.data;
  },
};
