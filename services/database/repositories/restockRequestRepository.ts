import { executeQuery, executeSelect, executeSelectOne } from '../db';
import { RestockRequest } from '../../../types/database';
import { v4 as uuidv4 } from 'uuid';

export const restockRequestRepository = {
  async getAll(): Promise<RestockRequest[]> {
    return await executeSelect(
      'SELECT * FROM restock_requests WHERE is_deleted = 0 ORDER BY created_at DESC'
    );
  },

  async getById(id: string): Promise<RestockRequest | null> {
    return await executeSelectOne(
      'SELECT * FROM restock_requests WHERE id = ? AND is_deleted = 0',
      [id]
    );
  },

  async getByStatus(status: string): Promise<RestockRequest[]> {
    return await executeSelect(
      'SELECT * FROM restock_requests WHERE status = ? AND is_deleted = 0 ORDER BY created_at DESC',
      [status]
    );
  },

  async create(request: Omit<RestockRequest, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'is_deleted'>): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO restock_requests (id, product_id, requested_quantity, status, notes, requested_by, created_at, updated_at, sync_status, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [id, request.product_id, request.requested_quantity, request.status || 'pending', request.notes, request.requested_by, now, now]
    );
    
    return id;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const now = new Date().toISOString();
    await executeQuery(
      "UPDATE restock_requests SET status = ?, updated_at = ?, sync_status = 'pending' WHERE id = ?",
      [status, now, id]
    );
  },

  async markSynced(id: string): Promise<void> {
    await executeQuery(
      "UPDATE restock_requests SET sync_status = 'synced' WHERE id = ?",
      [id]
    );
  },

  async getUnsynced(): Promise<RestockRequest[]> {
    return await executeSelect(
      "SELECT * FROM restock_requests WHERE sync_status = 'pending'"
    );
  },

  async upsert(request: RestockRequest): Promise<void> {
    const existing = await this.getById(request.id);
    
    if (existing) {
      if (new Date(request.updated_at) > new Date(existing.updated_at)) {
        await executeQuery(
          `UPDATE restock_requests SET product_id = ?, requested_quantity = ?, status = ?, notes = ?, requested_by = ?, updated_at = ?, sync_status = 'synced' WHERE id = ?`,
          [request.product_id, request.requested_quantity, request.status, request.notes, request.requested_by, request.updated_at, request.id]
        );
      }
    } else {
      await executeQuery(
        `INSERT INTO restock_requests (id, product_id, requested_quantity, status, notes, requested_by, created_at, updated_at, sync_status, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
        [request.id, request.product_id, request.requested_quantity, request.status, request.notes, request.requested_by, request.created_at, request.updated_at, request.is_deleted]
      );
    }
  }
};
