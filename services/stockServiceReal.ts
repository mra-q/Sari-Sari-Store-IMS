import apiClient from './apiClient';

export interface StockMovement {
  id: number;
  product: number;
  product_name: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  performed_by: number;
  performed_by_name: string;
  created_at: string;
}

export interface CycleCount {
  id: number;
  product: number;
  product_name: string;
  expected_quantity: number;
  actual_quantity?: number;
  variance?: number;
  status: 'pending' | 'in_progress' | 'completed';
  counted_by?: number;
  counted_by_name?: string;
  notes: string;
  created_at: string;
  completed_at?: string;
}

export interface RestockRequest {
  id: number;
  product: number;
  product_name: string;
  requested_quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_by: number;
  requested_by_name: string;
  approved_by?: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const stockServiceReal = {
  // Stock Movements
  getMovements: async (params?: any) => {
    const response = await apiClient.get('/stock/movements/', { params });
    return response.data;
  },

  createMovement: async (data: Partial<StockMovement>) => {
    const response = await apiClient.post('/stock/movements/', data);
    return response.data;
  },

  // Cycle Counts
  getCycleCounts: async (params?: any) => {
    const response = await apiClient.get('/stock/cycle-counts/', { params });
    return response.data;
  },

  createCycleCount: async (data: Partial<CycleCount>) => {
    const response = await apiClient.post('/stock/cycle-counts/', data);
    return response.data;
  },

  completeCycleCount: async (id: number, actualQuantity: number) => {
    const response = await apiClient.post(`/stock/cycle-counts/${id}/complete/`, {
      actual_quantity: actualQuantity,
    });
    return response.data;
  },

  // Restock Requests
  getRestockRequests: async (params?: any) => {
    const response = await apiClient.get('/stock/restock-requests/', { params });
    return response.data;
  },

  createRestockRequest: async (data: Partial<RestockRequest>) => {
    const response = await apiClient.post('/stock/restock-requests/', data);
    return response.data;
  },

  approveRestockRequest: async (id: number) => {
    const response = await apiClient.post(`/stock/restock-requests/${id}/approve/`);
    return response.data;
  },
};
