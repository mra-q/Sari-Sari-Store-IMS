import { executeQuery, executeSelect, executeSelectOne } from '../db';
import { StockMovement } from '../../../types/database';
import { v4 as uuidv4 } from 'uuid';

export const stockMovementRepository = {
  async getAll(): Promise<StockMovement[]> {
    return await executeSelect(
      'SELECT * FROM stock_movements WHERE is_deleted = 0 ORDER BY created_at DESC'
    );
  },

  async getById(id: string): Promise<StockMovement | null> {
    return await executeSelectOne(
      'SELECT * FROM stock_movements WHERE id = ? AND is_deleted = 0',
      [id]
    );
  },

  async getByProductId(productId: string): Promise<StockMovement[]> {
    return await executeSelect(
      'SELECT * FROM stock_movements WHERE product_id = ? AND is_deleted = 0 ORDER BY created_at DESC',
      [productId]
    );
  },

  async getByType(type: string): Promise<StockMovement[]> {
    return await executeSelect(
      'SELECT * FROM stock_movements WHERE movement_type = ? AND is_deleted = 0 ORDER BY created_at DESC',
      [type]
    );
  },

  async getByDateRange(startDate: string, endDate: string): Promise<StockMovement[]> {
    return await executeSelect(
      'SELECT * FROM stock_movements WHERE created_at BETWEEN ? AND ? AND is_deleted = 0 ORDER BY created_at DESC',
      [startDate, endDate]
    );
  },

  async create(movement: Omit<StockMovement, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'is_deleted'>): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO stock_movements (id, product_id, movement_type, quantity, reason, notes, performed_by, created_at, updated_at, sync_status, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [id, movement.product_id, movement.movement_type, movement.quantity, movement.reason, movement.notes, movement.performed_by, now, now]
    );
    
    return id;
  },

  async markSynced(id: string): Promise<void> {
    await executeQuery(
      'UPDATE stock_movements SET sync_status = \'synced\' WHERE id = ?',
      [id]
    );
  },

  async getUnsynced(): Promise<StockMovement[]> {
    return await executeSelect(
      'SELECT * FROM stock_movements WHERE sync_status = \'pending\''
    );
  },

  async upsert(movement: StockMovement): Promise<void> {
    const existing = await this.getById(movement.id);
    
    if (!existing) {
      await executeQuery(
        `INSERT INTO stock_movements (id, product_id, movement_type, quantity, reason, notes, performed_by, created_at, updated_at, sync_status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
        [movement.id, movement.product_id, movement.movement_type, movement.quantity, movement.reason, movement.notes, movement.performed_by, movement.created_at, movement.updated_at, movement.is_deleted]
      );
    }
  }
};
