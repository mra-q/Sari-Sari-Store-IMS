import { getProducts, updateProductStock } from '@/services/productService';
import { getStockMovements } from '@/services/stockMovementService';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/services/config';
import type { InventorySummary, Product } from '@/types/product';

const resolveLowStockLevel = (product: Product, fallback: number) =>
  product.minimumStockLevel ?? fallback;

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const getLowStockProducts = async (threshold = DEFAULT_LOW_STOCK_THRESHOLD): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(
    (product) => product.stock <= resolveLowStockLevel(product, threshold),
  );
};

export const getInventorySummary = async (): Promise<InventorySummary> => {
  const [products, movements] = await Promise.all([
    getProducts(),
    getStockMovements(),
  ]);

  const lowStockItems = products.filter(
    (product) => product.stock <= resolveLowStockLevel(product, DEFAULT_LOW_STOCK_THRESHOLD),
  );

  const categoryCountMap = products.reduce<Record<string, number>>((acc, current) => {
    acc[current.category] = (acc[current.category] ?? 0) + 1;
    return acc;
  }, {});

  const categorySummary = Object.entries(categoryCountMap).map(([category, count]) => ({
    category,
    count,
  }));

  const today = new Date();
  const stockAddedToday = movements
    .filter((item) => item.direction === 'in' && isSameDay(new Date(item.createdAt), today))
    .reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalProducts: products.length,
    lowStockCount: lowStockItems.length,
    stockAddedToday,
    totalStockUnits: products.reduce((sum, product) => sum + product.stock, 0),
    estimatedInventoryValue: products.reduce((sum, product) => sum + product.price * product.stock, 0),
    categorySummary,
  };
};

export const updateStockQuantity = async (productId: string, quantity: number): Promise<Product> => {
  return updateProductStock(productId, quantity);
};

export const inventoryService = {
  getLowStockProducts,
  getInventorySummary,
  updateStockQuantity,
};
