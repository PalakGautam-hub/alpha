import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/** Format large numbers with K/M suffix */
export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Format category slug to display name */
export function formatCategory(category: string): string {
  return category
    .split('-')
    .map((w) => capitalize(w))
    .join(' ');
}

/** Get stock status label and color */
export function getStockStatus(stock: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (stock === 0) return { label: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-500/10' };
  if (stock <= 10) return { label: 'Low Stock', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  if (stock <= 50)
    return { label: 'In Stock', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  return { label: 'High Stock', color: 'text-blue-400', bg: 'bg-blue-500/10' };
}

/** Generate a unique ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** Truncate text to max length */
export function truncate(text: string, max = 50): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

/** Calculate percentage */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/** Get rating stars display */
export function getRatingStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}
