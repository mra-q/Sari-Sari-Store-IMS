import apiClient from './apiClient';
import type { StockTransactionDTO } from '@/types/dto';

interface BackendStockMovement {
  id: number;
  product: number;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  created_at: string;
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

export const getStockTransactions = async (): Promise<StockTransactionDTO[]> => {
  const movements = await fetchAllPages<BackendStockMovement>('/stock/movements/');

  return movements.map((movement) => ({
    id: String(movement.id),
    productId: String(movement.product),
    type: movement.movement_type === 'in' ? 'stock_in' : 'stock_out',
    quantity: movement.quantity,
    createdAt: movement.created_at,
  }));
};

export const stockService = {
  getStockTransactions,
};
