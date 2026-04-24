export type RestockRequestStatus = 'pending' | 'approved' | 'ordered' | 'fulfilled' | 'rejected';

export interface RestockRequest {
  id: string;
  productId: string;
  productName: string;
  requestedQty: number;
  notes?: string;
  status: RestockRequestStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface RestockRequestInput {
  productId: string;
  productName: string;
  requestedQty: number;
  notes?: string;
}

export const RESTOCK_STATUS_LABELS: Record<RestockRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  ordered: 'Ordered',
  fulfilled: 'Fulfilled',
  rejected: 'Rejected',
};

export const RESTOCK_STATUS_COLORS: Record<RestockRequestStatus, string> = {
  pending: '#F59E0B',
  approved: '#2563EB',
  ordered: '#6366F1',
  fulfilled: '#10B981',
  rejected: '#EF4444',
};
