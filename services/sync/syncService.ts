import { networkService } from './networkService';
import { queueService } from './queueService';
import { productRepository } from '../database/repositories/productRepository';
import { inventoryRepository } from '../database/repositories/inventoryRepository';
import { stockMovementRepository } from '../database/repositories/stockMovementRepository';
import { cycleCountRepository } from '../database/repositories/cycleCountRepository';
import { restockRequestRepository } from '../database/repositories/restockRequestRepository';
import apiClient from '../apiClient';

export const syncService = {
  isSyncing: false,

  async syncNow(): Promise<{ success: boolean; message: string }> {
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    const isConnected = await networkService.isConnected();
    if (!isConnected) {
      return { success: false, message: 'No internet connection' };
    }

    this.isSyncing = true;

    try {
      // Step 1: Push local changes
      await this.pushChanges();

      // Step 2: Pull server changes
      await this.pullChanges();

      this.isSyncing = false;
      return { success: true, message: 'Sync completed successfully' };
    } catch (error: any) {
      this.isSyncing = false;
      return { success: false, message: error.message || 'Sync failed' };
    }
  },

  async pushChanges(): Promise<void> {
    const pendingItems = await queueService.getPendingItems();

    if (pendingItems.length === 0) return;

    const creates: any[] = [];
    const updates: any[] = [];
    const deletes: any[] = [];

    for (const item of pendingItems) {
      const payload = JSON.parse(item.payload);
      
      if (item.operation === 'create') {
        creates.push({ type: item.entity_type, data: payload });
      } else if (item.operation === 'update') {
        updates.push({ type: item.entity_type, data: payload });
      } else if (item.operation === 'delete') {
        deletes.push({ type: item.entity_type, id: item.entity_id });
      }
    }

    try {
      const response = await apiClient.post('/sync/', {
        creates,
        updates,
        deletes
      });

      // Mark items as synced
      for (const item of pendingItems) {
        await queueService.removeItem(item.id!);
        
        // Update local sync status
        if (item.entity_type === 'product') {
          await productRepository.markSynced(item.entity_id);
        } else if (item.entity_type === 'inventory') {
          await inventoryRepository.markSynced(item.entity_id);
        } else if (item.entity_type === 'stock_movement') {
          await stockMovementRepository.markSynced(item.entity_id);
        } else if (item.entity_type === 'cycle_count') {
          await cycleCountRepository.markSynced(item.entity_id);
        } else if (item.entity_type === 'restock_request') {
          await restockRequestRepository.markSynced(item.entity_id);
        }
      }
    } catch (error: any) {
      // Mark failed items
      for (const item of pendingItems) {
        await queueService.markFailed(item.id!, error.message);
      }
      throw error;
    }
  },

  async pullChanges(): Promise<void> {
    try {
      // Get last sync timestamp (simplified - you can store this in AsyncStorage)
      const response = await apiClient.get('/sync/pull/');

      const { products, inventory, stock_movements, cycle_counts, restock_requests } = response.data;

      // Upsert products
      for (const product of products || []) {
        await productRepository.upsert(product);
      }

      // Upsert inventory
      for (const inv of inventory || []) {
        await inventoryRepository.upsert(inv);
      }

      // Upsert stock movements
      for (const movement of stock_movements || []) {
        await stockMovementRepository.upsert(movement);
      }

      // Upsert cycle counts
      for (const count of cycle_counts || []) {
        await cycleCountRepository.upsert(count);
      }

      // Upsert restock requests
      for (const request of restock_requests || []) {
        await restockRequestRepository.upsert(request);
      }
    } catch (error) {
      throw error;
    }
  },

  async autoSync(): Promise<void> {
    const isConnected = await networkService.isConnected();
    if (isConnected && !this.isSyncing) {
      await this.syncNow();
    }
  },

  startAutoSync(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      this.autoSync();
    }, intervalMs);
  }
};
