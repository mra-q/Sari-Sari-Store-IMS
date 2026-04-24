import apiClient from './apiClient';
import { DEFAULT_LOW_STOCK_THRESHOLD } from './config';
import type { Product } from '@/types/product';

export interface ProductInput {
  name: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  minimumStockLevel?: number;
  sku?: string;
  description?: string;
  costPrice?: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface BackendCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

interface BackendProduct {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  category: number | null;
  category_name?: string;
  description?: string;
  unit_price: string | number;
  cost_price?: string | number;
  reorder_level?: number;
  current_stock?: number;
  is_low_stock?: boolean;
  image?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface InventoryRecord {
  id: number;
  product: BackendProduct;
  quantity: number;
  last_updated: string;
}

const isPaginatedResponse = <T,>(value: unknown): value is PaginatedResponse<T> => {
  return !!value && typeof value === 'object' && Array.isArray((value as PaginatedResponse<T>).results);
};

const fetchAllPages = async <T,>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T[]> => {
  console.log('fetchAllPages called with URL:', url);
  const items: T[] = [];
  let nextUrl: string | null = url;
  let nextParams = params;

  while (nextUrl) {
    console.log('Fetching:', nextUrl);
    const response = await apiClient.get(nextUrl, nextParams ? { params: nextParams } : undefined);
    const data = response.data;
    console.log('Response data:', data);

    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }

    if (isPaginatedResponse<T>(data)) {
      items.push(...data.results);
      nextUrl = data.next;
      nextParams = undefined;
      continue;
    }

    break;
  }

  console.log('fetchAllPages returning items:', items.length);
  return items;
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeText = (value?: string | null) => value?.trim() ?? '';

const toOptionalNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const slugifySkuSegment = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);

const generateSku = (input: ProductInput) => {
  const explicitSku = sanitizeText(input.sku);
  if (explicitSku) return explicitSku.toUpperCase();

  const base = slugifySkuSegment(input.name) || 'PRODUCT';
  const barcodeSegment = sanitizeText(input.barcode).slice(-6) || Date.now().toString().slice(-6);
  return `${base}-${barcodeSegment}`;
};

const mapBackendProductToProduct = (product: BackendProduct): Product => ({
  id: String(product.id),
  name: sanitizeText(product.name) || 'Unnamed Product',
  barcode: sanitizeText(product.barcode),
  category: sanitizeText(product.category_name) || 'Uncategorized',
  price: toNumber(product.unit_price),
  stock: toNumber(product.current_stock),
  minimumStockLevel: product.reorder_level ?? DEFAULT_LOW_STOCK_THRESHOLD,
  sku: sanitizeText(product.sku),
  categoryId: product.category != null ? String(product.category) : undefined,
  description: sanitizeText(product.description),
  costPrice: toNumber(product.cost_price),
  imageUrl: product.image_url ?? product.image ?? null,
  isActive: product.is_active ?? true,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});

const getCategories = async (): Promise<BackendCategory[]> => {
  console.log('Calling fetchAllPages for categories...');
  return fetchAllPages<BackendCategory>('/products/categories/');
};

const resolveCategoryId = async (categoryName: string): Promise<number | null> => {
  const normalizedName = sanitizeText(categoryName);

  if (!normalizedName) {
    return null;
  }

  const categories = await getCategories();
  const existingCategory = categories.find(
    (category) => sanitizeText(category.name).toLowerCase() === normalizedName.toLowerCase(),
  );

  if (existingCategory) {
    return existingCategory.id;
  }

  try {
    const response = await apiClient.post('/products/categories/', {
      name: normalizedName,
      description: '',
    });
    return response.data.id;
  } catch {
    const refreshedCategories = await getCategories();
    const matchedCategory = refreshedCategories.find(
      (category) => sanitizeText(category.name).toLowerCase() === normalizedName.toLowerCase(),
    );
    return matchedCategory?.id ?? null;
  }
};

const findInventoryRecord = async (productId: number, sku?: string) => {
  const inventoryRecords = sanitizeText(sku)
    ? await fetchAllPages<InventoryRecord>('/inventory/', { search: sku })
    : await fetchAllPages<InventoryRecord>('/inventory/');

  return inventoryRecords.find((record) => record.product?.id === productId) ?? null;
};

const syncInventoryQuantity = async (productId: number, quantity: number, sku?: string) => {
  const safeQuantity = Math.max(0, Math.trunc(quantity));
  const inventoryRecord = await findInventoryRecord(productId, sku);

  if (inventoryRecord) {
    await apiClient.patch(`/inventory/${inventoryRecord.id}/`, { quantity: safeQuantity });
    return;
  }

  await apiClient.post('/inventory/', {
    product_id: productId,
    quantity: safeQuantity,
  });
};

const getProducts = async (): Promise<Product[]> => {
  const products = await fetchAllPages<BackendProduct>('/products/');
  return products.map(mapBackendProductToProduct);
};

const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiClient.get(`/products/${id}/`);
    return mapBackendProductToProduct(response.data);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  const normalizedBarcode = sanitizeText(barcode);
  if (!normalizedBarcode) return null;

  try {
    const response = await apiClient.get(`/products/${normalizedBarcode}/by_barcode/`);
    return mapBackendProductToProduct(response.data);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

const createProduct = async (input: ProductInput): Promise<Product> => {
  const categoryId = await resolveCategoryId(input.category);
  const sku = generateSku(input);

  const response = await apiClient.post('/products/', {
    name: sanitizeText(input.name),
    sku,
    barcode: toOptionalNull(input.barcode),
    category: categoryId,
    description: sanitizeText(input.description),
    unit_price: toNumber(input.price).toFixed(2),
    cost_price: toNumber(input.costPrice).toFixed(2),
    reorder_level: input.minimumStockLevel ?? DEFAULT_LOW_STOCK_THRESHOLD,
    is_active: true,
  });

  await syncInventoryQuantity(response.data.id, input.stock, response.data.sku ?? sku);

  const createdProduct = await getProductById(String(response.data.id));
  if (!createdProduct) {
    throw new Error('Product was created but could not be reloaded.');
  }

  return createdProduct;
};

const updateProduct = async (id: string, input: ProductInput): Promise<Product> => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error('Product not found');
  }

  const categoryId = await resolveCategoryId(input.category);
  const sku = sanitizeText(input.sku) || existingProduct.sku || generateSku(input);

  await apiClient.patch(`/products/${id}/`, {
    name: sanitizeText(input.name),
    sku,
    barcode: toOptionalNull(input.barcode),
    category: categoryId,
    description: sanitizeText(input.description ?? existingProduct.description),
    unit_price: toNumber(input.price, existingProduct.price).toFixed(2),
    cost_price: toNumber(input.costPrice, existingProduct.costPrice ?? 0).toFixed(2),
    reorder_level:
      input.minimumStockLevel ?? existingProduct.minimumStockLevel ?? DEFAULT_LOW_STOCK_THRESHOLD,
  });

  await syncInventoryQuantity(Number(id), input.stock, sku);

  const updatedProduct = await getProductById(id);
  if (!updatedProduct) {
    throw new Error('Product was updated but could not be reloaded.');
  }

  return updatedProduct;
};

const updateProductStock = async (id: string, stock: number): Promise<Product> => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error('Product not found');
  }

  await syncInventoryQuantity(Number(id), stock, existingProduct.sku);

  const updatedProduct = await getProductById(id);
  if (!updatedProduct) {
    throw new Error('Product stock was updated but could not be reloaded.');
  }

  return updatedProduct;
};

export const updateStock = updateProductStock;

export const getCategoriesForDropdown = async (): Promise<{ id: string; name: string }[]> => {
  console.log('Fetching categories from backend...');
  console.log('API URL:', '/products/categories/');
  try {
    const categories = await getCategories();
    console.log('Raw categories:', categories);
    return categories.map((cat) => ({ id: String(cat.id), name: cat.name }));
  } catch (error: any) {
    console.error('Error fetching categories:', error.response?.status, error.response?.data);
    throw error;
  }
};

export const productService = {
  getProducts,
  getProductById,
  getProductByBarcode,
  updateProductStock,
  updateStock,
  createProduct,
  updateProduct,
};

export {
  createProduct,
  getProductByBarcode,
  getProductById,
  getProducts,
  updateProduct,
  updateProductStock,
};
