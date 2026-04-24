import { createStockMovement } from '@/services/stockMovementService';
import { getProductById } from '@/services/productService';
import type { StockMovement } from '@/types/stockMovement';

export interface CycleCountResult {
  productId: string;
  previousStock: number;
  countedStock: number;
  delta: number;
  movement?: StockMovement;
}

export const applyCycleCount = async (
  productId: string,
  countedStock: number,
  performedBy: string,
  performedByName: string,
  notes?: string,
): Promise<CycleCountResult> => {
  const product = await getProductById(productId);
  if (!product) throw new Error('Product not found');

  const previousStock = product.stock;
  const delta = countedStock - previousStock;

  if (delta === 0) {
    return { productId, previousStock, countedStock, delta };
  }

  const movement = await createStockMovement(
    {
      productId,
      direction: delta > 0 ? 'in' : 'out',
      reason: 'cycle_count',
      quantity: Math.abs(delta),
      notes,
    },
    performedBy,
    performedByName,
  );

  return {
    productId,
    previousStock,
    countedStock,
    delta,
    movement,
  };
};

export const cycleCountService = {
  applyCycleCount,
};
