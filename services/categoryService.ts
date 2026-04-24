import apiClient from './apiClient';

export interface Category {
  id: string;
  name: string;
}

interface BackendCategory {
  id: number;
  name: string;
}

interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
}

const isPaginatedResponse = <T,>(value: unknown): value is PaginatedResponse<T> => {
  return !!value && typeof value === 'object' && Array.isArray((value as PaginatedResponse<T>).results);
};

const fetchAllPages = async <T,>(url: string): Promise<T[]> => {
  const items: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const response = await apiClient.get(nextUrl);
    const data = response.data;

    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }

    if (isPaginatedResponse<T>(data)) {
      items.push(...data.results);
      nextUrl = data.next;
      continue;
    }

    break;
  }

  return items;
};

const mapCategory = (category: BackendCategory): Category => ({
  id: String(category.id),
  name: category.name,
});

export const getCategories = async (): Promise<Category[]> => {
  const categories = await fetchAllPages<BackendCategory>('/products/categories/');
  return categories.map(mapCategory);
};

export const createCategory = async (name: string): Promise<Category> => {
  const response = await apiClient.post('/products/categories/', {
    name,
    description: '',
  });

  return mapCategory(response.data);
};

export const updateCategory = async (id: string, name: string): Promise<Category> => {
  const response = await apiClient.patch(`/products/categories/${id}/`, {
    name,
  });

  return mapCategory(response.data);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/categories/${id}/`);
};

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
