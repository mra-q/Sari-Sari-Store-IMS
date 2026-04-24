import apiClient from './apiClient';

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  category: number;
  category_name?: string;
  description: string;
  unit_price: string;
  cost_price: string;
  reorder_level: number;
  current_stock: number;
  is_low_stock: boolean;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export const productService = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/products/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/products/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Product>) => {
    const response = await apiClient.post('/products/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>) => {
    const response = await apiClient.put(`/products/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/products/${id}/`);
  },

  getLowStock: async () => {
    const response = await apiClient.get('/products/low_stock/');
    return response.data;
  },

  getByBarcode: async (barcode: string) => {
    const response = await apiClient.get(`/products/${barcode}/by_barcode/`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/products/categories/');
    return response.data;
  },

  createCategory: async (data: Partial<Category>) => {
    const response = await apiClient.post('/products/categories/', data);
    return response.data;
  },
};
