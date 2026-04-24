import { syncQueueRepository } from '../database/repositories/syncQueueRepository';

export const queueService = {
  async enqueue(entityType: string, entityId: string, operation: 'create' | 'update' | 'delete', payload: any): Promise<void> {
    await syncQueueRepository.add({
      entity_type: entityType,
      entity_id: entityId,
      operation,
      payload: JSON.stringify(payload)
    });
  },

  async getPendingItems(limit: number = 50) {
    return await syncQueueRepository.getPending(limit);
  },

  async removeItem(id: number): Promise<void> {
    await syncQueueRepository.remove(id);
  },

  async markFailed(id: number, error: string): Promise<void> {
    await syncQueueRepository.incrementRetry(id, error);
  },

  async getQueueCount(): Promise<number> {
    return await syncQueueRepository.getCount();
  },

  async clearQueue(): Promise<void> {
    await syncQueueRepository.clear();
  }
};
