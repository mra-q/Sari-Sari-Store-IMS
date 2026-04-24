import { apiRequest } from './api';

export interface RestockRequest {
  id: number;
  product: number;
  product_name?: string;
  requested_by?: number;
  requested_by_email?: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  approved_by?: number;
  approved_by_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RestockRequestCreateInput {
  product: number;
  quantity: number;
  reason?: string;
}

export const getRestockRequests = async (): Promise<RestockRequest[]> => {
  const response = await apiRequest<{ results: RestockRequest[] }>('/restock-requests/');
  return response.results || response as any;
};

export const getRestockRequestById = async (id: number): Promise<RestockRequest> => {
  return apiRequest<RestockRequest>(`/restock-requests/${id}/`);
};

export const createRestockRequest = async (data: RestockRequestCreateInput): Promise<RestockRequest> => {
  return apiRequest<RestockRequest>('/restock-requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const approveRestockRequest = async (id: number): Promise<RestockRequest> => {
  return apiRequest<RestockRequest>(`/restock-requests/${id}/approve/`, {
    method: 'POST',
  });
};

export const rejectRestockRequest = async (id: number): Promise<RestockRequest> => {
  return apiRequest<RestockRequest>(`/restock-requests/${id}/reject/`, {
    method: 'POST',
  });
};

export const restockRequestService = {
  getRestockRequests,
  getRestockRequestById,
  createRestockRequest,
  approveRestockRequest,
  rejectRestockRequest,
};
