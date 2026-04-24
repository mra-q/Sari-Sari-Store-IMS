import { executeQuery, executeSelect, executeSelectOne } from '../db';
import { SyncQueueItem } from '../../../types/database';

export const syncQueueRepository = {
  async add(item: Omit<SyncQueueItem, 'id' | 'retry_count' | 'created_at' | 'updated_at'>): Promise<void> {
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      [item.entity_type, item.entity_id, item.operation, item.payload, now, now]
    );
  },

  async getAll(): Promise<SyncQueueItem[]> {
    return await executeSelect(
      'SELECT * FROM sync_queue ORDER BY created_at ASC'
    );
  },

  async getPending(limit: number = 50): Promise<SyncQueueItem[]> {
    return await executeSelect(
      'SELECT * FROM sync_queue WHERE retry_count < 3 ORDER BY created_at ASC LIMIT ?',
      [limit]
    );
  },

  async remove(id: number): Promise<void> {
    await executeQuery(
      'DELETE FROM sync_queue WHERE id = ?',
      [id]
    );
  },

  async incrementRetry(id: number, error: string): Promise<void> {
    const now = new Date().toISOString();
    
    await executeQuery(
      'UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ?, updated_at = ? WHERE id = ?',
      [error, now, id]
    );
  },

  async clear(): Promise<void> {
    await executeQuery('DELETE FROM sync_queue');
  },

  async getCount(): Promise<number> {
    const result = await executeSelectOne('SELECT COUNT(*) as count FROM sync_queue');
    return result?.count || 0;
  }
};
