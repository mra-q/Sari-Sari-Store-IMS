// Database Types

export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  sync_status: SyncStatus;
  is_deleted: number;
}

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  barcode?: string;
  category?: string;
  unit?: string;
  reorder_level: number;
  price: number;
}

export interface Inventory extends BaseEntity {
  product_id: string;
  quantity: number;
  location?: string;
}

export interface StockMovement extends BaseEntity {
  product_id: string;
  movement_type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: number;
  reason?: string;
  notes?: string;
  performed_by?: string;
}

export interface RestockRequest extends BaseEntity {
  product_id: string;
  requested_quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  requested_by?: string;
}

export interface CycleCount extends BaseEntity {
  product_id: string;
  expected_quantity: number;
  actual_quantity: number;
  variance: number;
  counted_by?: string;
}

export interface SyncQueueItem {
  id?: number;
  entity_type: string;
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: string;
  retry_count: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
}
