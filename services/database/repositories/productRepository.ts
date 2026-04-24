import { executeQuery, executeSelect, executeSelectOne } from '../db';
import { Product } from '../../../types/database';
import { v4 as uuidv4 } from 'uuid';

export const productRepository = {
  async getAll(): Promise<Product[]> {
    return await executeSelect(
      'SELECT * FROM products WHERE is_deleted = 0 ORDER BY name ASC'
    );
  },

  async getById(id: string): Promise<Product | null> {
    return await executeSelectOne(
      'SELECT * FROM products WHERE id = ? AND is_deleted = 0',
      [id]
    );
  },

  async getByBarcode(barcode: string): Promise<Product | null> {
    return await executeSelectOne(
      'SELECT * FROM products WHERE barcode = ? AND is_deleted = 0',
      [barcode]
    );
  },

  async getLowStock(): Promise<Product[]> {
    return await executeSelect(`
      SELECT p.* FROM products p
      INNER JOIN inventory i ON p.id = i.product_id
      WHERE p.is_deleted = 0 AND i.quantity <= p.reorder_level
      ORDER BY i.quantity ASC
    `);
  },

  async getLowStockWithSeverity(): Promise<any[]> {
    return await executeSelect(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        i.quantity as current_quantity,
        p.reorder_level,
        CASE 
          WHEN i.quantity = 0 THEN 'critical'
          WHEN i.quantity <= (p.reorder_level * 0.25) THEN 'critical'
          WHEN i.quantity <= (p.reorder_level * 0.5) THEN 'urgent'
          ELSE 'monitor'
        END as severity,
        CAST((i.quantity * 100.0 / p.reorder_level) AS INTEGER) as percentage
      FROM products p
      INNER JOIN inventory i ON p.id = i.product_id
      WHERE p.is_deleted = 0 AND i.quantity <= p.reorder_level
      ORDER BY severity DESC, i.quantity ASC
    `);
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'is_deleted'>): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO products (id, name, description, barcode, category, unit, reorder_level, price, created_at, updated_at, sync_status, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [id, product.name, product.description, product.barcode, product.category, product.unit, product.reorder_level, product.price, now, now]
    );
    
    return id;
  },

  async update(id: string, product: Partial<Product>): Promise<void> {
    const now = new Date().toISOString();
    const fields = Object.keys(product).filter(k => k !== 'id' && k !== 'created_at');
    const values = fields.map(k => (product as any)[k]);
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    await executeQuery(
      `UPDATE products SET ${setClause}, updated_at = ?, sync_status = 'pending' WHERE id = ?`,
      [...values, now, id]
    );
  },

  async delete(id: string): Promise<void> {
    const now = new Date().toISOString();
    await executeQuery(
      "UPDATE products SET is_deleted = 1, updated_at = ?, sync_status = 'pending' WHERE id = ?",
      [now, id]
    );
  },

  async markSynced(id: string): Promise<void> {
    await executeQuery(
      "UPDATE products SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  },

  async getUnsynced(): Promise<Product[]> {
    return await executeSelect(
      "SELECT * FROM products WHERE sync_status = 'pending'"
    );
  },

  async upsert(product: Product): Promise<void> {
    const existing = await this.getById(product.id);
    
    if (existing) {
      if (new Date(product.updated_at) > new Date(existing.updated_at)) {
        await executeQuery(
          `UPDATE products SET name = ?, description = ?, barcode = ?, category = ?, unit = ?, reorder_level = ?, price = ?, updated_at = ?, sync_status = 'synced' WHERE id = ?`,
          [product.name, product.description, product.barcode, product.category, product.unit, product.reorder_level, product.price, product.updated_at, product.id]
        );
      }
    } else {
      await executeQuery(
        `INSERT INTO products (id, name, description, barcode, category, unit, reorder_level, price, created_at, updated_at, sync_status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
        [product.id, product.name, product.description, product.barcode, product.category, product.unit, product.reorder_level, product.price, product.created_at, product.updated_at, product.is_deleted]
      );
    }
  }
};
