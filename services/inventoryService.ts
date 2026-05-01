import { apiRequest } from '@/services/api';
import {
  getLowStockProductsFromBackend,
  getProducts,
  updateProductStock,
} from '@/services/productService';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/services/config';
import type { InventorySummary, Product } from '@/types/product';

const resolveLowStockLevel = (product: Product, fallback: number) =>
  product.minimumStockLevel ?? fallback;

export const getLowStockProducts = async (threshold = DEFAULT_LOW_STOCK_THRESHOLD): Promise<Product[]> => {
  if (threshold === DEFAULT_LOW_STOCK_THRESHOLD) {
    return getLowStockProductsFromBackend();
  }

  const products = await getProducts();
  return products.filter(
    (product) => product.stock <= resolveLowStockLevel(product, threshold),
  );
};

export const getInventorySummary = async (): Promise<InventorySummary> => {
  return apiRequest<InventorySummary>('/inventory/summary/');
};

export const updateStockQuantity = async (productId: string, quantity: number): Promise<Product> => {
  return updateProductStock(productId, quantity);
};

export const inventoryService = {
  getLowStockProducts,
  getInventorySummary,
  updateStockQuantity,
};
