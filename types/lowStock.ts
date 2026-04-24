export type StockSeverity = 'critical' | 'urgent' | 'monitor';

export interface LowStockItem {
  product_id: string;
  product_name: string;
  current_quantity: number;
  reorder_level: number;
  severity: StockSeverity;
  percentage: number;
}

export const getStockSeverity = (quantity: number, reorderLevel: number): StockSeverity => {
  if (quantity === 0) return 'critical';
  const percentage = (quantity / reorderLevel) * 100;
  if (percentage <= 25) return 'critical';
  if (percentage <= 50) return 'urgent';
  return 'monitor';
};

export const SEVERITY_COLORS = {
  critical: '#DC2626',
  urgent: '#F59E0B',
  monitor: '#3B82F6',
};

export const SEVERITY_LABELS = {
  critical: 'Critical',
  urgent: 'Urgent',
  monitor: 'Monitor',
};
