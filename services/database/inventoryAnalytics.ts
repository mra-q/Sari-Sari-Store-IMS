import { executeSelect, executeSelectOne } from '../database/db';

export interface InventoryAnalytics {
  totalInventoryValue: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  fastMovingItems: FastMovingItem[];
  slowMovingItems: SlowMovingItem[];
  frequentAdjustments: FrequentAdjustment[];
  stockTrends: StockTrend[];
}

export interface FastMovingItem {
  product_id: string;
  product_name: string;
  movement_count: number;
  total_quantity_moved: number;
}

export interface SlowMovingItem {
  product_id: string;
  product_name: string;
  current_quantity: number;
  days_since_last_movement: number;
}

export interface FrequentAdjustment {
  product_id: string;
  product_name: string;
  adjustment_count: number;
  total_variance: number;
}

export interface StockTrend {
  date: string;
  stock_in: number;
  stock_out: number;
}

export const inventoryAnalyticsService = {
  async getInventoryValue(): Promise<number> {
    const result = await executeSelectOne(`
      SELECT SUM(i.quantity * p.price) as total_value
      FROM inventory i
      INNER JOIN products p ON i.product_id = p.id
      WHERE p.is_deleted = 0
    `);
    return result?.total_value || 0;
  },

  async getTotalProducts(): Promise<number> {
    const result = await executeSelectOne(
      'SELECT COUNT(*) as count FROM products WHERE is_deleted = 0'
    );
    return result?.count || 0;
  },

  async getLowStockCount(): Promise<number> {
    const result = await executeSelectOne(`
      SELECT COUNT(*) as count
      FROM products p
      INNER JOIN inventory i ON p.id = i.product_id
      WHERE p.is_deleted = 0 AND i.quantity <= p.reorder_level AND i.quantity > 0
    `);
    return result?.count || 0;
  },

  async getOutOfStockCount(): Promise<number> {
    const result = await executeSelectOne(`
      SELECT COUNT(*) as count
      FROM products p
      INNER JOIN inventory i ON p.id = i.product_id
      WHERE p.is_deleted = 0 AND i.quantity = 0
    `);
    return result?.count || 0;
  },

  async getFastMovingItems(limit: number = 10, days: number = 30): Promise<FastMovingItem[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await executeSelect(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        COUNT(sm.id) as movement_count,
        SUM(sm.quantity) as total_quantity_moved
      FROM products p
      INNER JOIN stock_movements sm ON p.id = sm.product_id
      WHERE p.is_deleted = 0 
        AND sm.movement_type = 'stock_out'
        AND sm.created_at >= ?
      GROUP BY p.id, p.name
      ORDER BY movement_count DESC, total_quantity_moved DESC
      LIMIT ?
    `, [cutoffDate.toISOString(), limit]);
  },

  async getSlowMovingItems(limit: number = 10, days: number = 30): Promise<SlowMovingItem[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await executeSelect(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        i.quantity as current_quantity,
        CAST((julianday('now') - julianday(MAX(sm.created_at))) AS INTEGER) as days_since_last_movement
      FROM products p
      INNER JOIN inventory i ON p.id = i.product_id
      LEFT JOIN stock_movements sm ON p.id = sm.product_id
      WHERE p.is_deleted = 0 AND i.quantity > 0
      GROUP BY p.id, p.name, i.quantity
      HAVING days_since_last_movement > ? OR days_since_last_movement IS NULL
      ORDER BY days_since_last_movement DESC
      LIMIT ?
    `, [days, limit]);
  },

  async getFrequentAdjustments(limit: number = 10, days: number = 30): Promise<FrequentAdjustment[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await executeSelect(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        COUNT(sm.id) as adjustment_count,
        SUM(ABS(sm.quantity)) as total_variance
      FROM products p
      INNER JOIN stock_movements sm ON p.id = sm.product_id
      WHERE p.is_deleted = 0 
        AND sm.movement_type = 'adjustment'
        AND sm.created_at >= ?
      GROUP BY p.id, p.name
      ORDER BY adjustment_count DESC
      LIMIT ?
    `, [cutoffDate.toISOString(), limit]);
  },

  async getStockTrends(days: number = 7): Promise<StockTrend[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await executeSelect(`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN movement_type = 'stock_in' THEN quantity ELSE 0 END) as stock_in,
        SUM(CASE WHEN movement_type = 'stock_out' THEN quantity ELSE 0 END) as stock_out
      FROM stock_movements
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [cutoffDate.toISOString()]);
  },

  async getFullAnalytics(): Promise<InventoryAnalytics> {
    const [
      totalInventoryValue,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      fastMovingItems,
      slowMovingItems,
      frequentAdjustments,
      stockTrends
    ] = await Promise.all([
      this.getInventoryValue(),
      this.getTotalProducts(),
      this.getLowStockCount(),
      this.getOutOfStockCount(),
      this.getFastMovingItems(10, 30),
      this.getSlowMovingItems(10, 30),
      this.getFrequentAdjustments(10, 30),
      this.getStockTrends(7)
    ]);

    return {
      totalInventoryValue,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      fastMovingItems,
      slowMovingItems,
      frequentAdjustments,
      stockTrends
    };
  }
};
