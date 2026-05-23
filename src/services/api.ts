import axios from 'axios';
import type { Product, ProductsResponse, CategoryResponse } from '@/types';

// Axios instance with base config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Product Endpoints ────────────────────────────────────────────────────────

/**
 * Fetch all products with optional limit and skip
 */
export const fetchProducts = async (
  limit = 194,
  skip = 0,
  select?: string
): Promise<ProductsResponse> => {
  const params: Record<string, string | number> = { limit, skip };
  if (select) params.select = select;
  const { data } = await api.get<ProductsResponse>('/products', { params });
  return data;
};

/**
 * Fetch a single product by ID
 */
export const fetchProduct = async (id: number): Promise<Product> => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

/**
 * Search products by query string
 */
export const searchProducts = async (query: string, limit = 100): Promise<ProductsResponse> => {
  const { data } = await api.get<ProductsResponse>('/products/search', {
    params: { q: query, limit },
  });
  return data;
};

/**
 * Fetch products by category
 */
export const fetchProductsByCategory = async (
  category: string,
  limit = 100
): Promise<ProductsResponse> => {
  const { data } = await api.get<ProductsResponse>(`/products/category/${category}`, {
    params: { limit },
  });
  return data;
};

/**
 * Fetch all categories
 */
export const fetchCategories = async (): Promise<CategoryResponse[]> => {
  const { data } = await api.get<CategoryResponse[]>('/products/categories');
  return data;
};

export default api;
