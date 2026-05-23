import { useState, useEffect } from 'react';

/**
 * Debounce a value by the specified delay (ms).
 * Returns the debounced value after the delay has passed without updates.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
