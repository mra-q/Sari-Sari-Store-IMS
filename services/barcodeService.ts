import { getProductByBarcode } from '@/services/productService';
import type { Product } from '@/types/product';

export const normalizeBarcode = (value: string) => value.trim();

export const lookupBarcode = async (barcode: string): Promise<Product | null> => {
  const normalized = normalizeBarcode(barcode);
  if (!normalized) return null;
  return getProductByBarcode(normalized);
};

export const barcodeService = {
  normalizeBarcode,
  lookupBarcode,
};
