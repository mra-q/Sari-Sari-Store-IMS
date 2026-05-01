import apiClient from './apiClient';
import { getProductById, getProducts } from '@/services/productService';
import type {
  MovementDirection,
  MovementReason,
  StockMovement,
  StockMovementInput,
} from '@/types/stockMovement';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface BackendStockMovement {
  id: number;
  product: number;
  product_name?: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'stock_in' | 'stock_out';
  quantity: number;
  reason: string;
  performed_by?: number | null;
  performed_by_name?: string;
  created_at: string;
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

const normalizeMovementDirection = (movementType: BackendStockMovement['movement_type']): MovementDirection => {
  return movementType === 'in' || movementType === 'stock_in' ? 'in' : 'out';
};

const normalizeMovementReason = (
  rawReason: string | undefined,
  fallbackDirection: MovementDirection,
): MovementReason => {
  const normalizedReason = rawReason?.trim().toLowerCase();

  if (!normalizedReason) {
    return fallbackDirection === 'in' ? 'restock' : 'sale';
  }

  const exactMatchReasons: MovementReason[] = [
    'sale',
    'restock',
    'damage',
    'expired',
    'return',
    'theft',
    'adjustment',
    'cycle_count',
    'misc',
  ];

  if (exactMatchReasons.includes(normalizedReason as MovementReason)) {
    return normalizedReason as MovementReason;
  }

  if (normalizedReason.includes('cycle')) return 'cycle_count';
  if (normalizedReason.includes('receive') || normalizedReason.includes('restock')) return 'restock';
  if (normalizedReason.includes('return')) return 'return';
  if (normalizedReason.includes('damage')) return 'damage';
  if (normalizedReason.includes('expire')) return 'expired';
  if (normalizedReason.includes('theft') || normalizedReason.includes('lost')) return 'theft';
  if (normalizedReason.includes('adjust')) return 'adjustment';
  if (normalizedReason.includes('sale') || normalizedReason.includes('sold')) return 'sale';

  return fallbackDirection === 'in' ? 'restock' : 'misc';
};

export const getStockMovements = async (productId?: string): Promise<StockMovement[]> => {
  const [apiMovements, products] = await Promise.all([
    fetchAllPages<BackendStockMovement>('/stock/movements/'),
    getProducts(),
  ]);

  const currentStockByProduct = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.id] = product.stock;
    return acc;
  }, {});

  const filteredMovements = productId
    ? apiMovements.filter((movement) => String(movement.product) === productId)
    : apiMovements;

  return filteredMovements.map((movement) => {
    const normalizedDirection = normalizeMovementDirection(movement.movement_type);
    const newStock = currentStockByProduct[String(movement.product)] ?? 0;
    const previousStock =
      normalizedDirection === 'in'
        ? newStock - movement.quantity
        : newStock + movement.quantity;

    currentStockByProduct[String(movement.product)] = previousStock;

    return {
      id: String(movement.id),
      productId: String(movement.product),
      productName: movement.product_name ?? 'Product',
      direction: normalizedDirection,
      reason: normalizeMovementReason(movement.reason, normalizedDirection),
      quantity: movement.quantity,
      previousStock,
      newStock,
      performedBy: movement.performed_by != null ? String(movement.performed_by) : 'system',
      performedByName: movement.performed_by_name ?? 'System',
      createdAt: movement.created_at,
    };
  });
};

export const createStockMovement = async (
  input: StockMovementInput,
  performedBy: string,
  performedByName: string,
): Promise<StockMovement> => {
  const product = await getProductById(input.productId);
  if (!product) throw new Error('Product not found');

  const previousStock = product.stock;
  const newStock =
    input.direction === 'in'
      ? previousStock + input.quantity
      : previousStock - input.quantity;

  if (newStock < 0) {
    throw new Error(
      `Insufficient stock. Current: ${previousStock}, Requested: ${input.quantity}`,
    );
  }

  const response = await apiClient.post('/stock/movements/', {
    product: Number(input.productId),
    movement_type: input.direction === 'in' ? 'stock_in' : 'stock_out',
    quantity: input.quantity,
    reason: input.reason,
  });

  const updatedProduct = await getProductById(input.productId);

  return {
    id: String(response.data.id),
    productId: input.productId,
    productName: response.data.product_name ?? product.name,
    direction: input.direction,
    reason: input.reason,
    quantity: input.quantity,
    previousStock,
    newStock: updatedProduct?.stock ?? newStock,
    notes: input.notes,
    performedBy: response.data.performed_by != null ? String(response.data.performed_by) : performedBy,
    performedByName: response.data.performed_by_name ?? performedByName,
    createdAt: response.data.created_at,
  };
};

export const stockMovementService = {
  getStockMovements,
  createStockMovement,
};
