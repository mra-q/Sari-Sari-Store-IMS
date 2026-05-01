export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  minimumStockLevel?: number;
  sku?: string;
  categoryId?: string;
  description?: string;
  costPrice?: number;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventorySummary {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount?: number;
  stockAddedToday: number;
  totalStockUnits: number;
  estimatedInventoryValue: number;
  categorySummary: Array<{
    category: string;
    count: number;
  }>;
}
