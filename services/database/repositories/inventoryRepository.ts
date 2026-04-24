import { executeQuery, executeSelect, executeSelectOne } from '../db';
import { Inventory } from '../../../types/database';
import { v4 as uuidv4 } from 'uuid';

export const inventoryRepository = {
  async getAll(): Promise<Inventory[]> {
    return await executeSelect(
      'SELECT * FROM inventory WHERE is_deleted = 0'
    );
  },

  async getById(id: string): Promise<Inventory | null> {
    return await executeSelectOne(
      'SELECT * FROM inventory WHERE id = ? AND is_deleted = 0',
      [id]
    );
  },

  async getByProductId(productId: string): Promise<Inventory | null> {
    return await executeSelectOne(
      'SELECT * FROM inventory WHERE product_id = ? AND is_deleted = 0',
      [productId]
    );
  },

  async create(inventory: Omit<Inventory, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'is_deleted'>): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO inventory (id, product_id, quantity, location, created_at, updated_at, sync_status, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [id, inventory.product_id, inventory.quantity, inventory.location, now, now]
    );
    
    return id;
  },

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    const now = new Date().toISOString();
    
    await executeQuery(
      `UPDATE inventory SET quantity = ?, updated_at = ?, sync_status = 'pending' WHERE product_id = ?`,
      [quantity, now, productId]
    );
  },

  async adjustQuantity(productId: string, delta: number): Promise<void> {
    const now = new Date().toISOString();
    
    await executeQuery(
      `UPDATE inventory SET quantity = quantity + ?, updated_at = ?, sync_status = 'pending' WHERE product_id = ?`,
      [delta, now, productId]
    );
  },

  async markSynced(id: string): Promise<void> {
    await executeQuery(
      'UPDATE inventory SET sync_status = \'synced\' WHERE id = ?',
      [id]
    );
  },

  async getUnsynced(): Promise<Inventory[]> {
    return await executeSelect(
      'SELECT * FROM inventory WHERE sync_status = \'pending\''
    );
  },

  async upsert(inventory: Inventory): Promise<void> {
    const existing = await this.getById(inventory.id);
    
    if (existing) {
      if (new Date(inventory.updated_at) > new Date(existing.updated_at)) {
        await executeQuery(
          `UPDATE inventory SET product_id = ?, quantity = ?, location = ?, updated_at = ?, sync_status = 'synced' WHERE id = ?`,
          [inventory.product_id, inventory.quantity, inventory.location, inventory.updated_at, inventory.id]
        );
      }
    } else {
      await executeQuery(
        `INSERT INTO inventory (id, product_id, quantity, location, created_at, updated_at, sync_status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, 'synced', ?)`,
        [inventory.id, inventory.product_id, inventory.quantity, inventory.location, inventory.created_at, inventory.updated_at, inventory.is_deleted]
      );
    }
  }
};
