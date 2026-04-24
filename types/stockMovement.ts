export type MovementReason =
  | 'sale'
  | 'restock'
  | 'damage'
  | 'expired'
  | 'return'
  | 'theft'
  | 'adjustment'
  | 'cycle_count'
  | 'misc';

export type MovementDirection = 'in' | 'out';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  direction: MovementDirection;
  reason: MovementReason;
  quantity: number;
  previousStock: number;
  newStock: number;
  notes?: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface StockMovementInput {
  productId: string;
  direction: MovementDirection;
  reason: MovementReason;
  quantity: number;
  notes?: string;
}

export const MOVEMENT_REASON_LABELS: Record<MovementReason, string> = {
  sale: 'Sale',
  restock: 'Restock',
  damage: 'Damage',
  expired: 'Expired',
  return: 'Return',
  theft: 'Theft',
  adjustment: 'Adjustment',
  cycle_count: 'Cycle Count',
  misc: 'Miscellaneous',
};

export const MOVEMENT_REASON_DIRECTIONS: Record<MovementReason, MovementDirection> = {
  sale: 'out',
  restock: 'in',
  damage: 'out',
  expired: 'out',
  return: 'in',
  theft: 'out',
  adjustment: 'in',
  cycle_count: 'in',
  misc: 'in',
};
