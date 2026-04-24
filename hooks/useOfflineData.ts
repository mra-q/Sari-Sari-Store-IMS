import { useState, useEffect } from 'react';
import { productRepository } from '../services/database/repositories/productRepository';
import { inventoryRepository } from '../services/database/repositories/inventoryRepository';
import { stockMovementRepository } from '../services/database/repositories/stockMovementRepository';
import { queueService } from '../services/sync/queueService';
import { Product, Inventory, StockMovement } from '../types/database';

export const useOfflineData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, inv, movements] = await Promise.all([
        productRepository.getAll(),
        inventoryRepository.getAll(),
        stockMovementRepository.getAll()
      ]);
      
      setProducts(prods);
      setInventory(inv);
      setStockMovements(movements);
    } catch (error) {
      console.error('Error loading offline data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'is_deleted'>) => {
    const id = await productRepository.create(product);
    const newProduct = await productRepository.getById(id);
    
    if (newProduct) {
      await queueService.enqueue('product', id, 'create', newProduct);
      await loadData();
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await productRepository.update(id, updates);
    const updated = await productRepository.getById(id);
    
    if (updated) {
      await queueService.enqueue('product', id, 'update', updated);
      await loadData();
    }
  };

  const deleteProduct = async (id: string) => {
    await productRepository.delete(id);
    await queueService.enqueue('product', id, 'delete', { id });
    await loadData();
  };

  const updateInventoryQuantity = async (productId: string, quantity: number) => {
    await inventoryRepository.updateQuantity(productId, quantity);
    const updated = await inventoryRepository.getByProductId(productId);
    
    if (updated) {
      await queueService.enqueue('inventory', updated.id, 'update', updated);
      await loadData();
    }
  };

  const createStockMovement = async (movement: Omit<StockMovement, 'id' | 'created_at' | 'updated_at' | 'sync_status' | 'is_deleted'>) => {
    const id = await stockMovementRepository.create(movement);
    const newMovement = await stockMovementRepository.getById(id);
    
    // Update inventory based on movement type
    const delta = movement.movement_type === 'stock_in' ? movement.quantity : -movement.quantity;
    await inventoryRepository.adjustQuantity(movement.product_id, delta);
    
    if (newMovement) {
      await queueService.enqueue('stock_movement', id, 'create', newMovement);
      await loadData();
    }
  };

  return {
    products,
    inventory,
    stockMovements,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    updateInventoryQuantity,
    createStockMovement,
    refresh: loadData
  };
};
