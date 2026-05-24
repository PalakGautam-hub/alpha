import { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Package,
  ClipboardList,
} from 'lucide-react';
import { useSidebarStore, useCartStore, useOrderStore } from '@/store';
import { cn } from '@/utils';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/cart', label: 'Cart', icon: ShoppingCart },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const location = useLocation();
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const activeShipments = useOrderStore((state) =>
    state.orders.filter((o) => o.status !== 'Delivered').length
  );

  return (
    <aside
      className={cn(
        'relative hidden flex-col border-r transition-all duration-300 ease-in-out lg:flex',
        'border-white/[0.06] bg-surface-800',
        isCollapsed ? 'w-16' : 'w-60'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/[0.06]',
          isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-5'
        )}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-rose-700 shadow-lg shadow-brand-500/20">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide text-white"
            >
              Omega Dashboard
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-4" role="navigation">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive =
            path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(path);
          const isCart = path === '/cart';
          const isOrders = path === '/orders';
          return (
            <NavLink
              key={path}
              to={path}
              title={isCollapsed ? label : undefined}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'nav-link-active bg-brand-500/10 text-brand-400'
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/90',
                isCollapsed ? 'justify-center' : 'gap-3'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 flex-shrink-0 transition-colors',
                    isActive ? 'text-brand-400' : 'text-white/40 group-hover:text-white/80'
                  )}
                  aria-hidden="true"
                />
                {isCart && totalItems > 0 && isCollapsed && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-500 ring-1 ring-surface-800" />
                )}
                {isOrders && activeShipments > 0 && isCollapsed && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-surface-800 animate-pulse" />
                )}
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
                  >
                    <span>{label}</span>
                    {isCart && totalItems > 0 && (
                      <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {totalItems}
                      </span>
                    )}
                    {isOrders && activeShipments > 0 && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                        {activeShipments}
                      </span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className={cn(
          'flex items-center border-t border-white/[0.06] p-3',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-rose-600 text-xs font-bold text-white">
            A
          </div>
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-800 bg-emerald-400" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-w-0 flex-1"
            >
              <p className="truncate text-xs font-medium text-white/90">Admin User</p>
              <p className="truncate text-[11px] text-white/40">admin@omega.dev</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-surface-700 text-white/60 shadow-lg transition-all hover:bg-surface-600 hover:text-white"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}

export default memo(Sidebar);
