import { executeQuery, executeSelect, executeSelectOne } from '../db';
import { CycleCount } from '../../../types/database';
import { v4 as uuidv4 } from 'uuid';
import { inventoryRepository } from './inventoryRepository';
import { stockMovementRepository } from './stockMovementRepository';

export const cycleCountRepository = {
  async getAll(): Promise<CycleCount[]> {
    return await executeSelect(
      'SELECT * FROM cycle_counts WHERE is_deleted = 0 ORDER BY created_at DESC'
    );
  },

  async getById(id: string): Promise<CycleCount | null> {
    return await executeSelectOne(
      'SELECT * FROM cycle_counts WHERE id = ? AND is_deleted = 0',
      [id]
    );
  },

  async getByProduct(productId: string): Promise<CycleCount[]> {
    return await executeSelect(
      'SELECT * FROM cycle_counts WHERE product_id = ? AND is_deleted = 0 ORDER BY created_at DESC',
      [productId]
    );
  },

  async create(cycleCount: Omit<CycleCount, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'is_deleted'>): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO cycle_counts (id, product_id, expected_quantity, actual_quantity, variance, counted_by, created_at, updated_at, sync_status, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [id, cycleCount.product_id, cycleCount.expected_quantity, cycleCount.actual_quantity, cycleCount.variance, cycleCount.counted_by, now, now]
    );
    
    return id;
  },

  async createWithAdjustment(
    productId: string,
    expectedQuantity: number,
    actualQuantity: number,
    countedBy: string,
    notes?: string
  ): Promise<{ cycleCountId: string; adjustmentId?: string }> {
    const variance = actualQuantity - expectedQuantity;
    const cycleCountId = await this.create({
      product_id: productId,
      expected_quantity: expectedQuantity,
      actual_quantity: actualQuantity,
      variance,
      counted_by: countedBy,
    });

    let adjustmentId: string | undefined;

    // Auto-create adjustment if variance exists
    if (variance !== 0) {
      adjustmentId = await stockMovementRepository.create({
        product_id: productId,
        movement_type: 'adjustment',
        quantity: Math.abs(variance),
        reason: 'cycle_count',
        notes: notes || `Cycle count adjustment. Variance: ${variance}`,
        performed_by: countedBy,
      });

      // Update inventory
      await inventoryRepository.updateQuantity(productId, actualQuantity);
    }

    return { cycleCountId, adjustmentId };
  },

  async markSynced(id: string): Promise<void> {
    await executeQuery(
      "UPDATE cycle_counts SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  },

  async getUnsynced(): Promise<CycleCount[]> {
    return await executeSelect(
      "SELECT * FROM cycle_counts WHERE sync_status = 'pending'"
    );
  },

  async upsert(cycleCount: CycleCount): Promise<void> {
    const existing = await this.getById(cycleCount.id);
    
    if (existing) {
      if (new Date(cycleCount.updated_at) > new Date(existing.updated_at)) {
        await executeQuery(
          `UPDATE cycle_counts SET product_id = ?, expected_quantity = ?, actual_quantity = ?, variance = ?, counted_by = ?, updated_at = ?, sync_status = 'synced' WHERE id = ?`,
          [cycleCount.product_id, cycleCount.expected_quantity, cycleCount.actual_quantity, cycleCount.variance, cycleCount.counted_by, cycleCount.updated_at, cycleCount.id]
        );
      }
    } else {
      await executeQuery(
        `INSERT INTO cycle_counts (id, product_id, expected_quantity, actual_quantity, variance, counted_by, created_at, updated_at, sync_status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
        [cycleCount.id, cycleCount.product_id, cycleCount.expected_quantity, cycleCount.actual_quantity, cycleCount.variance, cycleCount.counted_by, cycleCount.created_at, cycleCount.updated_at, cycleCount.is_deleted]
      );
    }
  }
};
