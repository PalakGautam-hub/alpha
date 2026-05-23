import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProducts, fetchCategories } from '@/services/api';
import type { Product, CategoryResponse } from '@/types';

interface UseProductsOptions {
  pollInterval?: number; // ms, 0 = disabled
}

interface UseProductsReturn {
  products: Product[];
  categories: CategoryResponse[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

/**
 * Fetch all products and categories from the API.
 * Supports polling for simulated real-time updates.
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { pollInterval = 30_000 } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const loadData = useCallback(async (isBackground = false) => {
    if (!mountedRef.current) return;
    if (isBackground) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [productsRes, catsRes] = await Promise.all([
        fetchProducts(194, 0),
        fetchCategories(),
      ]);

      if (!mountedRef.current) return;
      setProducts(productsRes.products);
      setCategories(catsRes);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      if (!mountedRef.current) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    loadData(false);
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  // Polling
  useEffect(() => {
    if (!pollInterval) return;
    const id = setInterval(() => loadData(true), pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, loadData]);

  return {
    products,
    categories,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refetch: () => loadData(true),
  };
}
