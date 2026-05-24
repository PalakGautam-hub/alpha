import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import RatingStars from '@/components/ui/RatingStars';
import { formatCurrency, formatCategory, getStockStatus, cn, truncate } from '@/utils';
import type { Product } from '@/types';

export function buildColumns(
  navigate: (path: string) => void,
  theme: string,
  onAddToCart?: (product: Product) => void
): ColumnDef<Product>[] {
  return [
    {
      id: 'thumbnail',
      header: 'Image',
      accessorKey: 'thumbnail',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/products/${row.original.id}`)}
          className="group relative h-10 w-10 overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.03] transition-transform hover:scale-110"
          aria-label={`View ${row.original.title}`}
        >
          <img
            src={row.original.thumbnail}
            alt={row.original.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </button>
      ),
    },
    {
      id: 'title',
      header: 'Product',
      accessorKey: 'title',
      enableSorting: true,
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/products/${row.original.id}`)}
          className={cn(
            'group flex flex-col items-start text-left',
            theme === 'dark' ? 'hover:text-brand-400' : 'hover:text-brand-600'
          )}
        >
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              theme === 'dark' ? 'text-white/90' : 'text-gray-900'
            )}
          >
            {truncate(row.original.title, 40)}
          </span>
          <span
            className={cn(
              'flex items-center gap-1 text-xs',
              theme === 'dark' ? 'text-white/30' : 'text-gray-400'
            )}
          >
            <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
            #{row.original.id}
          </span>
        </button>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      enableSorting: true,
      cell: ({ getValue }) => (
        <Badge variant="info">{formatCategory(getValue() as string)}</Badge>
      ),
    },
    {
      id: 'brand',
      header: 'Brand',
      accessorKey: 'brand',
      enableSorting: true,
      cell: ({ getValue }) => (
        <span
          className={cn('text-xs', theme === 'dark' ? 'text-white/50' : 'text-gray-500')}
        >
          {(getValue() as string) || '—'}
        </span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      accessorKey: 'price',
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <p
            className={cn(
              'text-sm font-semibold tabular-nums',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            {formatCurrency(row.original.price)}
          </p>
          {row.original.discountPercentage > 0 && (
            <p className="text-[10px] text-emerald-400">
              -{row.original.discountPercentage.toFixed(0)}% off
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      accessorKey: 'stock',
      enableSorting: true,
      cell: ({ getValue }) => {
        const stock = getValue() as number;
        const status = getStockStatus(stock);
        return (
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium tabular-nums', status.color)}>{stock}</span>
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', status.bg, status.color)}>
              {status.label}
            </span>
          </div>
        );
      },
    },
    {
      id: 'rating',
      header: 'Rating',
      accessorKey: 'rating',
      enableSorting: true,
      cell: ({ getValue }) => (
        <RatingStars rating={getValue() as number} showValue size="sm" />
      ),
    },
    {
      id: 'discountPercentage',
      header: 'Discount',
      accessorKey: 'discountPercentage',
      enableSorting: true,
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return val > 0 ? (
          <Badge variant="success">-{val.toFixed(0)}%</Badge>
        ) : (
          <span className={cn('text-xs', theme === 'dark' ? 'text-white/20' : 'text-gray-300')}>—</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original;
        const isOutOfStock = product.stock <= 0;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row navigation click
              if (onAddToCart && !isOutOfStock) {
                onAddToCart(product);
              }
            }}
            disabled={isOutOfStock}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-150',
              isOutOfStock
                ? theme === 'dark'
                  ? 'border-white/[0.04] bg-white/[0.01] text-white/20 cursor-not-allowed'
                  : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                : theme === 'dark'
                  ? 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:bg-brand-500/10 hover:border-brand-500/40 hover:text-brand-400'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-brand-50 hover:border-brand-400/40 hover:text-brand-600'
            )}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        );
      },
    },
  ];
}
