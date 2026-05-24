import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Printer,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrderStore, useCartStore, useThemeStore, type OrderStatus, type Order } from '@/store';
import { formatCurrency, formatCategory, cn } from '@/utils';
import Badge from '@/components/ui/Badge';

// ─── Status Settings Config ──────────────────────────────────────────────────
const STATUS_STEPS: { status: OrderStatus; label: string; desc: string; icon: any; color: string }[] = [
  {
    status: 'Processing',
    label: 'Order Placed',
    desc: 'We are preparing your item details.',
    icon: ShoppingBag,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    status: 'Shipped',
    label: 'Shipped',
    desc: 'Item packed and handed to courier.',
    icon: Package,
    color: 'from-amber-500 to-orange-500',
  },
  {
    status: 'In Transit',
    label: 'In Transit',
    desc: 'Order is on its way to your destination.',
    icon: Truck,
    color: 'from-brand-500 to-rose-600',
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    desc: 'Order has been successfully delivered!',
    icon: CheckCircle,
    color: 'from-emerald-500 to-teal-500',
  },
];

const STATUS_PROGRESS: Record<OrderStatus, number> = {
  Processing: 25,
  Shipped: 50,
  'In Transit': 75,
  Delivered: 100,
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { orders, updateOrderStatus, clearOrders } = useOrderStore();
  const { addItem } = useCartStore();

  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Re-order All Items back into the Cart
  const handleReorder = (order: Order) => {
    order.items.forEach(({ product, quantity }) => {
      addItem(product, quantity);
    });
    toast.success('All items from this order re-loaded into your Cart!', {
      icon: '🛒',
    });
    navigate('/cart');
  };

  // Manually cycle order status for testing timelines
  const handleCycleStatus = (orderId: string, currentStatus: OrderStatus) => {
    const statuses: OrderStatus[] = ['Processing', 'Shipped', 'In Transit', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateOrderStatus(orderId, nextStatus);
    toast.success(`Order status updated to "${nextStatus}"`, { icon: '🔄' });
  };

  const handlePrintOrder = (orderId: string) => {
    toast.success(`Printing invoice for Order #${orderId}`);
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className={cn(
              'text-2xl font-bold tracking-tight md:text-3xl',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            Order Tracking & History
          </h1>
          <p className={cn('mt-0.5 text-sm', theme === 'dark' ? 'text-white/40' : 'text-gray-500')}>
            {orders.length === 0
              ? 'No active orders'
              : `You have placed ${orders.length} order${orders.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {orders.length > 0 && (
          <button
            onClick={() => {
              clearOrders();
              toast.success('Orders history cleared.');
            }}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {orders.length === 0 ? (
          /* ─── Empty Orders History State ─── */
          <motion.div
            key="empty-orders"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm lg:p-20 border-dashed border-white/[0.08]"
          >
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/10 to-indigo-500/10 shadow-lg shadow-brand-500/5">
              <ClipboardList className="h-9 w-9 text-brand-400" />
            </div>
            <h2
              className={cn(
                'text-xl font-bold tracking-tight',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}
            >
              No Orders Recorded Yet
            </h2>
            <p className={cn('mx-auto mt-2 max-w-sm text-sm leading-relaxed', theme === 'dark' ? 'text-white/50' : 'text-gray-500')}>
              Your completed invoice records and active shipment tracking timelines will show up here as soon as you checkout.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/30 active:translate-y-0"
            >
              Shop Catalog
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          /* ─── Orders List ─── */
          <motion.div
            key="orders-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {orders.map((order) => {
              const isExpanded = expandedOrders[order.id] || false;
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const progressPercentage = STATUS_PROGRESS[order.status];

              return (
                <motion.div
                  key={order.id}
                  layout
                  className={cn(
                    'overflow-hidden rounded-2xl border shadow-sm transition-all',
                    theme === 'dark' ? 'border-white/[0.06] bg-surface-800' : 'border-gray-200 bg-white'
                  )}
                >
                  {/* Order Card Header Summary */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-4 p-5 cursor-pointer select-none transition-colors border-b',
                      theme === 'dark'
                        ? 'border-white/[0.05] hover:bg-white/[0.01]'
                        : 'border-gray-100 hover:bg-gray-50/50'
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
                      <div className="space-y-1">
                        <span className={cn('text-2xs font-semibold uppercase tracking-wider', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
                          Invoice Ref
                        </span>
                        <p className={cn('font-bold font-mono tracking-tight text-brand-400')}>
                          #{order.id}
                        </p>
                      </div>

                      <div className="h-8 w-px bg-white/[0.05]" />

                      <div className="space-y-1">
                        <span className={cn('text-2xs font-semibold uppercase tracking-wider', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
                          Date Placed
                        </span>
                        <p className={cn('font-medium', theme === 'dark' ? 'text-white/80' : 'text-gray-800')}>
                          {new Date(order.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="h-8 w-px bg-white/[0.05]" />

                      <div className="space-y-1">
                        <span className={cn('text-2xs font-semibold uppercase tracking-wider', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
                          Total Amount
                        </span>
                        <p className={cn('font-bold tabular-nums', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                          {formatCurrency(order.totals.total)}
                        </p>
                      </div>

                      <div className="h-8 w-px bg-white/[0.05]" />

                      <div className="space-y-1">
                        <span className={cn('text-2xs font-semibold uppercase tracking-wider', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
                          Quantity
                        </span>
                        <p className={cn('font-medium text-center', theme === 'dark' ? 'text-white/80' : 'text-gray-800')}>
                          {totalItems} item{totalItems > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Order Status Badge */}
                      <Badge
                        variant={
                          order.status === 'Delivered'
                            ? 'success'
                            : order.status === 'In Transit'
                              ? 'info'
                              : 'warning'
                        }
                      >
                        {order.status}
                      </Badge>

                      {isExpanded ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
                    </div>
                  </div>

                  {/* Shipment Tracking Timeline Block */}
                  <div className="p-5 md:p-6 space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'}>
                          Delivery Progress Indicator
                        </span>
                        <span className="font-bold text-brand-400">{progressPercentage}% Complete</span>
                      </div>
                      
                      {/* Horizontal progress bar */}
                      <div className={cn('relative h-2 w-full rounded-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100')}>
                        <motion.div
                          className="absolute h-full rounded-full bg-gradient-to-r from-brand-500 via-rose-500 to-emerald-500 shadow-md shadow-brand-500/10"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Timeline Milestones Checkpoints Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 sm:gap-2">
                      {STATUS_STEPS.map((step, index) => {
                        const stepIndexes: Record<OrderStatus, number> = {
                          Processing: 0,
                          Shipped: 1,
                          'In Transit': 2,
                          Delivered: 3,
                        };
                        const orderStepIndex = stepIndexes[order.status];
                        const isCompleted = index <= orderStepIndex;
                        const isCurrent = index === orderStepIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.status} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center sm:gap-1.5">
                            {/* Checkpoint Icon */}
                            <div
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300',
                                isCompleted
                                  ? `bg-gradient-to-br ${step.color} border-transparent text-white shadow-lg`
                                  : theme === 'dark'
                                    ? 'border-white/[0.08] bg-white/[0.02] text-white/20'
                                    : 'border-gray-200 bg-white text-gray-300',
                                isCurrent && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface-900 animate-pulse'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            {/* Descriptions */}
                            <div className="space-y-0.5">
                              <h4
                                className={cn(
                                  'text-xs font-bold transition-colors',
                                  isCompleted ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-white/20'
                                )}
                              >
                                {step.label}
                              </h4>
                              <p
                                className={cn(
                                  'text-[10px] leading-relaxed transition-colors',
                                  isCompleted ? (theme === 'dark' ? 'text-white/40' : 'text-gray-500') : 'text-white/10'
                                )}
                              >
                                {isCompleted ? step.desc : 'Scheduled milestone'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Diagnostic / Expansion Block */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/[0.05]"
                      >
                        {/* Expanded details container */}
                        <div
                          className={cn(
                            'p-5 md:p-6 space-y-6 text-xs',
                            theme === 'dark' ? 'bg-white/[0.01]' : 'bg-gray-50/30'
                          )}
                        >
                          {/* Diagnostic controls row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-500/5 border border-brand-500/10 p-3">
                            <span className="flex items-center gap-1.5 font-bold text-brand-400">
                              <Zap className="h-3.5 w-3.5" />
                              Diagnostic Tools
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCycleStatus(order.id, order.status)}
                                className="flex items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-2xs font-semibold text-brand-400 hover:bg-brand-500 hover:text-white transition-colors"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Cycle Status Timeline
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Left panel: Item list summary */}
                            <div className="md:col-span-2 space-y-3">
                              <h3 className={cn('text-xs font-bold border-b pb-2 border-white/[0.05]', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                                Itemized Summary ({order.items.length})
                              </h3>
                              <div className="divide-y divide-white/[0.04] max-h-60 overflow-y-auto pr-2">
                                {order.items.map(({ product, quantity }) => (
                                  <div key={product.id} className="flex items-center gap-3 py-3">
                                    <div
                                      className={cn(
                                        'h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border',
                                        theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-200 bg-white'
                                      )}
                                    >
                                      <img src={product.thumbnail} alt="" className="h-full w-full object-contain p-1" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className={cn('truncate font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                                        {product.title}
                                      </h4>
                                      <p className="text-[10px] text-white/30">
                                        Qty: {quantity} × {formatCurrency(product.price * (1 - product.discountPercentage / 100))}
                                      </p>
                                    </div>
                                    <p className="font-bold tabular-nums">
                                      {formatCurrency(product.price * (1 - product.discountPercentage / 100) * quantity)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right panel: Totals and Shipping */}
                            <div className="space-y-4 rounded-xl border border-white/[0.05] p-4 bg-white/[0.01]">
                              <div className="space-y-2">
                                <h3 className={cn('text-xs font-bold border-b pb-1.5 border-white/[0.05]', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                                  Shipping Destination
                                </h3>
                                <p className="font-semibold text-white/80">{order.shippingAddress.name}</p>
                                <p className="text-white/40">{order.shippingAddress.address}</p>
                                <p className="text-white/40">
                                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                                </p>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                                <h3 className={cn('text-xs font-bold border-b pb-1.5 border-white/[0.05]', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                                  Invoice Summary
                                </h3>
                                <div className="space-y-1.5 tabular-nums text-white/50">
                                  <div className="flex justify-between">
                                    <span>Items Subtotal</span>
                                    <span className="font-medium text-white/70">{formatCurrency(order.totals.subtotal)}</span>
                                  </div>
                                  {order.totals.discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                      <span>Coupon Discount</span>
                                      <span className="font-semibold">-{formatCurrency(order.totals.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-medium text-white/70">
                                      {order.totals.shipping === 0 ? 'FREE' : formatCurrency(order.totals.shipping)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span className="font-medium text-white/70">{formatCurrency(order.totals.tax)}</span>
                                  </div>
                                  <hr className="border-white/[0.05] my-1" />
                                  <div className="flex justify-between text-xs font-bold text-white">
                                    <span>Grand Total</span>
                                    <span className="text-brand-400">{formatCurrency(order.totals.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Actions row */}
                          <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-white/[0.04]">
                            <button
                              onClick={() => handlePrintOrder(order.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 hover:bg-white/[0.05] transition-colors"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Print Invoice
                            </button>
                            <button
                              onClick={() => handleReorder(order)}
                              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-rose-600 px-4 py-2 font-semibold text-white shadow-md hover:shadow-brand-500/20 active:scale-95 transition-transform"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Re-order All Items
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
