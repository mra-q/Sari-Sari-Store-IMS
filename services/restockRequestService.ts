import apiClient from './apiClient';
import type { RestockRequest, RestockRequestInput, RestockRequestStatus } from '@/types/restockRequest';

interface BackendRestockRequest {
  id: number;
  product: number;
  product_name?: string;
  requested_quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_by?: number | null;
  requested_by_name?: string;
  approved_by?: number | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
}

const isPaginatedResponse = <T,>(value: unknown): value is PaginatedResponse<T> => {
  return !!value && typeof value === 'object' && Array.isArray((value as PaginatedResponse<T>).results);
};

const fetchAllPages = async <T,>(url: string): Promise<T[]> => {
  const items: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const response = await apiClient.get(nextUrl);
    const data = response.data;

    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }

    if (isPaginatedResponse<T>(data)) {
      items.push(...data.results);
      nextUrl = data.next;
      continue;
    }

    break;
  }

  return items;
};

const mapStatus = (
  status: BackendRestockRequest['status'],
): RestockRequestStatus => {
  if (status === 'completed') return 'fulfilled';
  return status;
};

const mapRestockRequest = (request: BackendRestockRequest): RestockRequest => ({
  id: String(request.id),
  productId: String(request.product),
  productName: request.product_name ?? 'Product',
  requestedQty: request.requested_quantity,
  notes: request.notes ?? '',
  status: mapStatus(request.status),
  createdBy: request.requested_by != null ? String(request.requested_by) : 'system',
  createdByName: request.requested_by_name ?? 'System',
  createdAt: request.created_at,
  resolvedAt: request.status !== 'pending' ? request.updated_at : undefined,
});

export const getRestockRequests = async (
  status?: RestockRequestStatus,
): Promise<RestockRequest[]> => {
  const requests = await fetchAllPages<BackendRestockRequest>('/stock/restock-requests/');
  const mapped = requests.map(mapRestockRequest);

  if (!status) {
    return mapped;
  }

  return mapped.filter((request) => request.status === status);
};

export const createRestockRequest = async (
  input: RestockRequestInput,
): Promise<RestockRequest> => {
  const response = await apiClient.post('/stock/restock-requests/', {
    product: Number(input.productId),
    requested_quantity: input.requestedQty,
    notes: input.notes ?? '',
  });

  return mapRestockRequest(response.data);
};

export const updateRestockRequestStatus = async (
  id: string,
  status: RestockRequestStatus,
): Promise<RestockRequest> => {
  if (status === 'approved') {
    const response = await apiClient.post(`/stock/restock-requests/${id}/approve/`);
    return mapRestockRequest(response.data);
  }

  throw new Error(`Backend support for setting restock requests to "${status}" is not available yet.`);
};

export const restockRequestService = {
  getRestockRequests,
  createRestockRequest,
  updateRestockRequestStatus,
};
