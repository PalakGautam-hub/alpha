import {
  useState,
  useMemo,
  useCallback,
  memo,
  useEffect,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Eye,
  GripVertical,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { useThemeStore, usePreferencesStore } from '@/store';
import { formatCurrency, formatCategory, getStockStatus, cn, truncate } from '@/utils';
import Badge from '@/components/ui/Badge';
import RatingStars from '@/components/ui/RatingStars';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import type { Product, SortField, SortOrder } from '@/types';

import { buildColumns } from '@/features/products/columns';
import { ColumnVisibilityPanel } from '@/features/products/components/ColumnVisibilityPanel';
// Page size options
const PAGE_SIZES = [10, 20, 50];


function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useThemeStore();
  const { preferences, setColumnVisibility, setPageSize } = usePreferencesStore();

  // URL-synced state
  const searchQuery = searchParams.get('search') || '';
  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const sortField = (searchParams.get('sort') as SortField) || 'title';
  const sortOrder = (searchParams.get('order') as SortOrder) || 'asc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const minRating = parseFloat(searchParams.get('rating') || '0');

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  const debouncedSearch = useDebounce(localSearch, 400);

  // Sync debounced search to URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set('search', debouncedSearch);
        else next.delete('search');
        next.set('page', '1');
        return next;
      },
      { replace: true }
    );
  }, [debouncedSearch, setSearchParams]);

  const { products, categories, isLoading, isRefreshing, error, refetch } = useProducts({
    pollInterval: 30_000,
  });

  // ─── Filtering & sorting (all client-side) ───────────────────────────────

  const filtered = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    result = [...result].sort((a, b) => {
      let av: number | string = a[sortField as keyof Product] as number | string;
      let bv: number | string = b[sortField as keyof Product] as number | string;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchQuery, selectedCategories, minRating, sortField, sortOrder]);

  // ─── Pagination ──────────────────────────────────────────────────────────

  const pageSize = preferences.pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  // ─── URL param updaters ──────────────────────────────────────────────────

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          if (key !== 'page') next.set('page', '1');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        updateParam('order', sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('sort', field);
          next.set('order', 'asc');
          next.set('page', '1');
          return next;
        });
      }
    },
    [sortField, sortOrder, updateParam, setSearchParams]
  );

  const toggleCategory = useCallback(
    (cat: string) => {
      const next = selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat];
      updateParam('category', next.join(',') || null);
    },
    [selectedCategories, updateParam]
  );

  const resetFilters = useCallback(() => {
    setLocalSearch('');
    setSearchParams({});
  }, [setSearchParams]);

  // ─── Column visibility ───────────────────────────────────────────────────

  const columnVisibility = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(preferences.columnVisibility).map(([k, v]) => [k, v])
      ) as VisibilityState,
    [preferences.columnVisibility]
  );

  const toggleColumn = useCallback(
    (colId: string) => {
      const next = { ...preferences.columnVisibility, [colId]: !preferences.columnVisibility[colId] };
      setColumnVisibility(next);
      toast.success(
        `${colId} column ${next[colId] ? 'shown' : 'hidden'}`,
        { duration: 1500 }
      );
    },
    [preferences.columnVisibility, setColumnVisibility]
  );

  // ─── TanStack Table ──────────────────────────────────────────────────────

  const columns = useMemo(() => buildColumns(navigate, theme), [navigate, theme]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: paginated,
    columns,
    state: { columnVisibility, sorting },
    onSortingChange: setSorting,
    onColumnVisibilityChange: () => {},
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const hasFilters = searchQuery || selectedCategories.length > 0 || minRating > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Products
          </h1>
          <p className={`mt-0.5 text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            {isLoading ? 'Loading…' : `${filtered.length} of ${products.length} products`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRefreshing && (
            <span className="flex items-center gap-1.5 text-xs text-brand-400">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-brand-400" />
              Syncing
            </span>
          )}
          <button
            onClick={refetch}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              theme === 'dark'
                ? 'border-white/[0.07] bg-white/[0.03] text-white/60 hover:border-white/[0.12] hover:text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:text-gray-900'
            )}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search + Filters toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search
            className={cn(
              'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
              theme === 'dark' ? 'text-white/30' : 'text-gray-400'
            )}
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products…"
            className={cn(
              'h-9 w-full rounded-lg border pl-9 pr-3 text-sm transition-colors',
              theme === 'dark'
                ? 'border-white/[0.07] bg-white/[0.03] text-white placeholder:text-white/25 focus:border-brand-500/50 focus:bg-white/[0.05]'
                : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-400'
            )}
            aria-label="Search products"
          />
        </div>

        {/* Rating filter */}
        <select
          value={minRating}
          onChange={(e) => updateParam('rating', e.target.value === '0' ? null : e.target.value)}
          className={cn(
            'h-9 rounded-lg border px-3 text-sm transition-colors',
            theme === 'dark'
              ? 'border-white/[0.07] bg-white/[0.03] text-white/70'
              : 'border-gray-200 bg-white text-gray-700'
          )}
          aria-label="Filter by minimum rating"
        >
          <option value="0">All ratings</option>
          <option value="4">4+ ★</option>
          <option value="4.5">4.5+ ★</option>
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
            showFilters || selectedCategories.length > 0
              ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
              : theme === 'dark'
                ? 'border-white/[0.07] bg-white/[0.03] text-white/60 hover:text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:text-gray-900'
          )}
          aria-expanded={showFilters}
          aria-label="Toggle category filters"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {selectedCategories.length > 0 && (
            <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {selectedCategories.length}
            </span>
          )}
        </button>

        {/* Column visibility */}
        <div className="relative">
          <button
            onClick={() => setShowColumns(!showColumns)}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
              theme === 'dark'
                ? 'border-white/[0.07] bg-white/[0.03] text-white/60 hover:text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:text-gray-900'
            )}
            aria-expanded={showColumns}
            aria-label="Customize columns"
          >
            <Eye className="h-3.5 w-3.5" />
            Columns
          </button>
          <AnimatePresence>
            {showColumns && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                <ColumnVisibilityPanel
                  columnVisibility={columnVisibility}
                  onToggle={toggleColumn}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          {(['title', 'price', 'rating', 'stock'] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={cn(
                'flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                sortField === field
                  ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
                  : theme === 'dark'
                    ? 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:text-white/70'
                    : 'border-gray-200 bg-white text-gray-400 hover:text-gray-700'
              )}
              aria-label={`Sort by ${field}`}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {sortField === field &&
                (sortOrder === 'asc' ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                ))}
            </button>
          ))}
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            aria-label="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'rounded-xl border p-3',
                theme === 'dark'
                  ? 'border-white/[0.06] bg-white/[0.02]'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <p
                className={cn(
                  'mb-2.5 text-[11px] font-semibold uppercase tracking-widest',
                  theme === 'dark' ? 'text-white/30' : 'text-gray-400'
                )}
              >
                Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.slug);
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => toggleCategory(cat.slug)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                        isSelected
                          ? 'border-brand-500/40 bg-brand-500/15 text-brand-400'
                          : theme === 'dark'
                            ? 'border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/80'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      {formatCategory(cat.slug)}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div
        className={cn(
          'overflow-hidden rounded-xl border',
          theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-200'
        )}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className={cn('text-sm', theme === 'dark' ? 'text-white/60' : 'text-gray-500')}>
              {error}
            </p>
            <button
              onClick={refetch}
              className="rounded-lg bg-brand-500/10 px-4 py-2 text-sm text-brand-400 transition-colors hover:bg-brand-500/20"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table" aria-label="Products table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className={cn(
                      'border-b text-xs uppercase tracking-wider',
                      theme === 'dark'
                        ? 'border-white/[0.06] bg-white/[0.02] text-white/30'
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                    )}
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 font-medium"
                        scope="col"
                        style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                        onClick={
                          header.column.getCanSort()
                            ? () => toggleSort(header.id as SortField)
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && header.id !== 'thumbnail' && (
                            <span className="opacity-30">
                              {sortField === header.id ? (
                                sortOrder === 'asc' ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )
                              ) : (
                                <GripVertical className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading
                  ? Array.from({ length: pageSize }).map((_, i) => (
                      <TableRowSkeleton key={i} cols={table.getVisibleLeafColumns().length} />
                    ))
                  : filtered.length === 0
                    ? (
                      <tr>
                        <td
                          colSpan={table.getVisibleLeafColumns().length}
                          className="py-20 text-center"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <Package
                              className={cn(
                                'h-10 w-10',
                                theme === 'dark' ? 'text-white/10' : 'text-gray-200'
                              )}
                            />
                            <p
                              className={cn(
                                'text-sm font-medium',
                                theme === 'dark' ? 'text-white/40' : 'text-gray-400'
                              )}
                            >
                              No products found
                            </p>
                            <button
                              onClick={resetFilters}
                              className="text-xs text-brand-400 underline underline-offset-2"
                            >
                              Clear filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                    : table.getRowModel().rows.map((row) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="table-row-hover cursor-pointer"
                          onClick={() => navigate(`/products/${row.original.id}`)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={cn(
                                'px-4 py-3',
                                theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                              )}
                              onClick={
                                cell.column.id === 'thumbnail' || cell.column.id === 'title'
                                  ? (e) => e.stopPropagation()
                                  : undefined
                              }
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn('text-xs', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}
            >
              Rows per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                updateParam('page', '1');
              }}
              className={cn(
                'rounded-lg border px-2 py-1 text-xs',
                theme === 'dark'
                  ? 'border-white/[0.07] bg-white/[0.03] text-white/70'
                  : 'border-gray-200 bg-white text-gray-700'
              )}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={cn('mr-2 text-xs', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}
            >
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => updateParam('page', String(safePage - 1))}
              disabled={safePage <= 1}
              className={cn(
                'rounded-lg border p-1.5 transition-colors disabled:opacity-30',
                theme === 'dark'
                  ? 'border-white/[0.07] text-white/60 hover:bg-white/[0.05]'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              )}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) page = i + 1;
              else if (safePage <= 3) page = i + 1;
              else if (safePage >= totalPages - 2) page = totalPages - 4 + i;
              else page = safePage - 2 + i;
              return (
                <button
                  key={page}
                  onClick={() => updateParam('page', String(page))}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                    page === safePage
                      ? 'bg-brand-500 text-white'
                      : theme === 'dark'
                        ? 'text-white/40 hover:bg-white/[0.05] hover:text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === safePage ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => updateParam('page', String(safePage + 1))}
              disabled={safePage >= totalPages}
              className={cn(
                'rounded-lg border p-1.5 transition-colors disabled:opacity-30',
                theme === 'dark'
                  ? 'border-white/[0.07] text-white/60 hover:bg-white/[0.05]'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              )}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
