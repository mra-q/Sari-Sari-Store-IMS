import { apiRequest } from './api';

export interface CycleCountItem {
  id?: number;
  product: number;
  product_name?: string;
  product_barcode?: string;
  expected_quantity: number;
  counted_quantity?: number;
  variance?: number;
  notes?: string;
}

export interface CycleCount {
  id: number;
  count_number: string;
  performed_by?: number;
  performed_by_email?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  items?: CycleCountItem[];
}

export interface CycleCountCreateInput {
  count_number: string;
  notes?: string;
}

export const getCycleCounts = async (): Promise<CycleCount[]> => {
  const response = await apiRequest<{ results: CycleCount[] }>('/cycle-counts/');
  return response.results || response as any;
};

export const getCycleCountById = async (id: number): Promise<CycleCount> => {
  return apiRequest<CycleCount>(`/cycle-counts/${id}/`);
};

export const createCycleCount = async (data: CycleCountCreateInput): Promise<CycleCount> => {
  return apiRequest<CycleCount>('/cycle-counts/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const startCycleCount = async (id: number): Promise<CycleCount> => {
  return apiRequest<CycleCount>(`/cycle-counts/${id}/start/`, {
    method: 'POST',
  });
};

export const completeCycleCount = async (id: number): Promise<CycleCount> => {
  return apiRequest<CycleCount>(`/cycle-counts/${id}/complete/`, {
    method: 'POST',
  });
};

export const addCycleCountItem = async (cycleCountId: number, item: Omit<CycleCountItem, 'id'>): Promise<CycleCountItem> => {
  return apiRequest<CycleCountItem>(`/cycle-counts/${cycleCountId}/add_item/`, {
    method: 'POST',
    body: JSON.stringify(item),
  });
};

export const cycleCountService = {
  getCycleCounts,
  getCycleCountById,
  createCycleCount,
  startCycleCount,
  completeCycleCount,
  addCycleCountItem,
};
