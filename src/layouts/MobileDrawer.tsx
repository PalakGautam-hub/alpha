import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingCart, Settings, Zap, X } from 'lucide-react';
import { useSidebarStore, useThemeStore } from '@/store';
import { cn } from '@/utils';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: ShoppingCart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileDrawer() {
  const { isMobileOpen, setMobileOpen } = useSidebarStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col lg:hidden',
            theme === 'dark'
              ? 'border-r border-white/[0.06] bg-surface-800'
              : 'border-r border-black/[0.06] bg-white'
          )}
          aria-label="Mobile navigation"
        >
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span
                className={cn(
                  'text-sm font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}
              >
                Omega Dashboard
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className={cn(
                'rounded-lg p-1.5 transition-colors',
                theme === 'dark'
                  ? 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
              )}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive =
                path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(path);
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-brand-500/10 text-brand-400'
                      : theme === 'dark'
                        ? 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* User */}
          <div
            className={cn(
              'flex items-center gap-3 border-t p-4',
              theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'
            )}
          >
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-xs font-bold text-white">
                A
              </div>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-800 bg-emerald-400" />
            </div>
            <div>
              <p
                className={cn(
                  'text-xs font-medium',
                  theme === 'dark' ? 'text-white/90' : 'text-gray-900'
                )}
              >
                Admin User
              </p>
              <p className={cn('text-[11px]', theme === 'dark' ? 'text-white/40' : 'text-gray-400')}>
                admin@omega.dev
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
