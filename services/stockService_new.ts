import { apiRequest } from './api';

export interface StockMovement {
  id: number;
  product: number;
  product_name?: string;
  quantity: number;
  movement_type: 'IN' | 'OUT' | 'ADJUST';
  reason: 'Sale' | 'Damage' | 'Return' | 'Received' | 'Theft' | 'Misc' | 'CycleCount' | 'Restock';
  notes?: string;
  performed_by?: number;
  performed_by_email?: string;
  timestamp?: string;
  reference?: string;
}

export interface StockMovementCreateInput {
  product: number;
  quantity: number;
  movement_type: 'IN' | 'OUT' | 'ADJUST';
  reason: 'Sale' | 'Damage' | 'Return' | 'Received' | 'Theft' | 'Misc' | 'CycleCount' | 'Restock';
  notes?: string;
  reference?: string;
}

export const getStockMovements = async (productId?: number): Promise<StockMovement[]> => {
  const url = productId ? `/stock-movements/?product=${productId}` : '/stock-movements/';
  const response = await apiRequest<{ results: StockMovement[] }>(url);
  return response.results || response as any;
};

export const createStockMovement = async (data: StockMovementCreateInput): Promise<StockMovement> => {
  return apiRequest<StockMovement>('/stock-movements/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const stockService = {
  getStockMovements,
  createStockMovement,
};
