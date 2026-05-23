import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Star,
  DollarSign,
  Tag,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import StatCard from '@/features/dashboard/components/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/hooks/useProducts';
import { useThemeStore } from '@/store';
import { formatCurrency, formatNumber, formatCategory } from '@/utils';
import type { Product } from '@/types';

// Chart color palette
const CHART_COLORS = [
  '#f43f5e', '#a78bfa', '#34d399', '#fbbf24',
  '#f87171', '#38bdf8', '#fb923c', '#c084fc',
  '#4ade80', '#60a5fa', '#f472b6', '#a3e635',
];

// ─── Analytics computations ──────────────────────────────────────────────────

function computeAnalytics(products: Product[]) {
  if (!products.length) return null;

  const totalProducts = products.length;
  const averageRating = products.reduce((s, p) => s + p.rating, 0) / totalProducts;
  const totalInventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  // Category distribution
  const catMap = new Map<string, { count: number; stock: number; value: number }>();
  for (const p of products) {
    const cat = p.category;
    const existing = catMap.get(cat) || { count: 0, stock: 0, value: 0 };
    catMap.set(cat, {
      count: existing.count + 1,
      stock: existing.stock + p.stock,
      value: existing.value + p.price * p.stock,
    });
  }

  const categoryDistribution = Array.from(catMap.entries())
    .map(([name, d]) => ({ name: formatCategory(name), ...d }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Price analytics by category (top 8)
  const priceByCategory = Array.from(catMap.entries())
    .map(([name, d]) => {
      const catProducts = products.filter((p) => p.category === name);
      const avgPrice = catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length;
      return { category: formatCategory(name), avgPrice: Math.round(avgPrice), stock: d.stock };
    })
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, 8);

  return { totalProducts, averageRating, totalInventoryValue, categoryDistribution, priceByCategory };
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg border border-white/[0.08] bg-surface-700 p-3 text-xs shadow-xl">
      {label && <p className="mb-1.5 font-medium text-white/70">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || entry.fill }} className="font-semibold">
          {entry.name}: {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('price')
            ? formatCurrency(entry.value)
            : formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
});

// ─── Dashboard Page ──────────────────────────────────────────────────────────

function DashboardPage() {
  const { products, isLoading, isRefreshing, error, lastUpdated, refetch } = useProducts({
    pollInterval: 30_000,
  });
  const { theme } = useThemeStore();

  const analytics = useMemo(() => computeAnalytics(products), [products]);

  const axisColor = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Dashboard
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString()}`
              : 'Loading analytics…'}
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
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/[0.12] hover:text-white disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !analytics ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Products"
              value={formatNumber(analytics.totalProducts)}
              subtitle="Across all categories"
              icon={Package}
              gradient="from-brand-500 to-brand-600"
              delay={0}
            />
            <StatCard
              title="Average Rating"
              value={`${analytics.averageRating.toFixed(2)} ★`}
              subtitle="Customer satisfaction"
              icon={Star}
              gradient="from-amber-500 to-orange-500"
              delay={0.05}
            />
            <StatCard
              title="Inventory Value"
              value={formatCurrency(analytics.totalInventoryValue)}
              subtitle="Total stock value"
              icon={DollarSign}
              gradient="from-emerald-500 to-teal-500"
              delay={0.1}
            />
            <StatCard
              title="Categories"
              value={analytics.categoryDistribution.length}
              subtitle="Product categories"
              icon={Tag}
              gradient="from-purple-500 to-pink-500"
              delay={0.15}
            />
          </>
        )}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading || !analytics ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Pie chart - category distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-400" />
                <h2
                  className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Category Distribution
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="name"
                    >
                      {analytics.categoryDistribution.map((_, index) => (
                        <Cell
                          key={index}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          opacity={0.9}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {analytics.categoryDistribution.slice(0, 7).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span
                        className={`flex-1 truncate ${
                          theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                        }`}
                      >
                        {cat.name}
                      </span>
                      <span
                        className={`font-medium tabular-nums ${
                          theme === 'dark' ? 'text-white/80' : 'text-gray-900'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bar chart - stock by category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-400" />
                <h2
                  className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Stock by Category
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={analytics.categoryDistribution.slice(0, 8)}
                  margin={{ left: -20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: textColor, fontSize: 10 }}
                    angle={-35}
                    textAnchor="end"
                    stroke={axisColor}
                  />
                  <YAxis tick={{ fill: textColor, fontSize: 10 }} stroke={axisColor} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stock" name="Stock" radius={[4, 4, 0, 0]}>
                    {analytics.categoryDistribution.slice(0, 8).map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>

      {/* Area chart - avg price by category */}
      {!isLoading && analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <h2
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Average Price Analytics by Category
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.priceByCategory} margin={{ left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="category"
                tick={{ fill: textColor, fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                stroke={axisColor}
              />
              <YAxis tick={{ fill: textColor, fontSize: 10 }} stroke={axisColor} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: textColor, fontSize: 12, paddingTop: 8 }} />
              <Area
                type="monotone"
                dataKey="avgPrice"
                name="Avg Price ($)"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

export default DashboardPage;
