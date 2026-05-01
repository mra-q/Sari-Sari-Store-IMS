export interface ProductDTO {
  id: string | number;
  name: string;
  barcode: string;
  category: string;
  price: number;
  quantity: number;
  minimum_stock_level?: number;
}

export interface UserDTO {
  id: string | number;
  name: string;
  email: string;
  role: 'owner' | 'staff';
}

export interface StockTransactionDTO {
  id: string | number;
  productId: string;
  type: 'stock_in' | 'stock_out';
  quantity: number;
  createdAt: string;
}

export interface StockTransactionApiDTO {
  id: string | number;
  product_id: string | number;
  type: 'stock_in' | 'stock_out';
  quantity: number;
  created_at: string;
}

export interface CategoryDTO {
  id: string | number;
  name: string;
}

export interface StockMovementDTO {
  id: string | number;
  product_id?: string | number;
  product?: { id: string | number; name?: string } | string | number;
  product_name?: string;
  direction: 'in' | 'out';
  reason:
    | 'sale'
    | 'damage'
    | 'return'
    | 'theft'
    | 'restock'
    | 'adjustment'
    | 'cycle_count'
    | 'misc';
  quantity: number;
  previous_stock?: number;
  new_stock?: number;
  notes?: string;
  performed_by?: string | number;
  performed_by_name?: string;
  created_at: string;
}

export interface RestockRequestDTO {
  id: string | number;
  product_id?: string | number;
  product?: { id: string | number; name?: string } | string | number;
  product_name?: string;
  requested_qty: number;
  notes?: string;
  status: 'pending' | 'approved' | 'ordered' | 'fulfilled' | 'rejected';
  created_by?: string | number;
  created_by_name?: string;
  created_at: string;
  resolved_at?: string;
}

