import { apiRequest } from './api';

export interface Product {
  id: string | number;
  name: string;
  barcode: string;
  description?: string;
  category?: number;
  category_name?: string;
  unit_price: number;
  min_stock_level: number;
  current_stock: number;
  location?: string;
  expiry_date?: string;
  created_by?: number;
  created_by_email?: string;
  is_low_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  parent?: number;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductCreateInput {
  name: string;
  barcode: string;
  description?: string;
  category?: number;
  unit_price: number;
  min_stock_level: number;
  location?: string;
  expiry_date?: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiRequest<{ results: Product[] }>('/products/');
  return response.results || response as any;
};

export const getProductById = async (id: string | number): Promise<Product> => {
  return apiRequest<Product>(`/products/${id}/`);
};

export const getProductByBarcode = async (barcode: string): Promise<Product> => {
  return apiRequest<Product>(`/products/barcode/${barcode}/`);
};

export const createProduct = async (data: ProductCreateInput): Promise<Product> => {
  return apiRequest<Product>('/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateProduct = async (id: string | number, data: Partial<ProductCreateInput>): Promise<Product> => {
  return apiRequest<Product>(`/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteProduct = async (id: string | number): Promise<void> => {
  await apiRequest<void>(`/products/${id}/`, {
    method: 'DELETE',
  });
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  return apiRequest<Product[]>('/products/low_stock/');
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiRequest<{ results: Category[] }>('/categories/');
  return response.results || response as any;
};

export const createCategory = async (data: { name: string; description?: string; parent?: number }): Promise<Category> => {
  return apiRequest<Category>('/categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const productService = {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories,
  createCategory,
};
