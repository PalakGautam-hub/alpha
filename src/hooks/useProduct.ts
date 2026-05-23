import { useState, useEffect, useCallback } from 'react';
import { fetchProduct } from '@/services/api';
import type { Product } from '@/types';

interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch a single product by ID.
 */
export function useProduct(id: number | null): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProduct(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { product, isLoading, error, refetch: load };
}
