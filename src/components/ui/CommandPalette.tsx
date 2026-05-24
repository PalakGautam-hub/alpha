import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, LayoutDashboard, ShoppingCart, Settings, X, Package, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { cn } from '@/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof LayoutDashboard;
  path: string;
}

const COMMANDS: CommandItem[] = [
  {
    id: 'dashboard',
    label: 'Go to Dashboard',
    description: 'Analytics overview',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'products',
    label: 'Go to Products',
    description: 'Browse & manage products',
    icon: Package,
    path: '/products',
  },
  {
    id: 'cart',
    label: 'Go to Cart',
    description: 'View items in your shopping cart',
    icon: ShoppingCart,
    path: '/cart',
  },
  {
    id: 'orders',
    label: 'Go to Orders',
    description: 'Track and view your past orders',
    icon: ClipboardList,
    path: '/orders',
  },
  {
    id: 'settings',
    label: 'Go to Settings',
    description: 'Customize your preferences',
    icon: Settings,
    path: '/settings',
  },
];

function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Open with Ctrl+K or Cmd+K
  useKeyboardShortcut({ key: 'k', ctrlKey: true, callback: () => setIsOpen(true) });
  useKeyboardShortcut({ key: 'k', metaKey: true, callback: () => setIsOpen(true) });

  // Listen for custom event from TopBar
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    navigate(item.path);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      handleSelect(filtered[selected]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'fixed left-1/2 top-[20%] z-50 w-full max-w-md -translate-x-1/2 overflow-hidden rounded-xl shadow-2xl',
              theme === 'dark'
                ? 'border border-white/[0.08] bg-surface-700'
                : 'border border-gray-200 bg-white'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            {/* Search input */}
            <div
              className={cn(
                'flex items-center gap-3 border-b px-4 py-3',
                theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'
              )}
            >
              <Search
                className={cn('h-4 w-4 flex-shrink-0', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search…"
                className={cn(
                  'flex-1 bg-transparent text-sm outline-none placeholder:text-white/30',
                  theme === 'dark' ? 'text-white' : 'text-gray-900 placeholder:text-gray-400'
                )}
                aria-label="Command search"
              />
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  'rounded p-1 text-xs transition-colors',
                  theme === 'dark'
                    ? 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1]'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                )}
                aria-label="Close command palette"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto p-2" role="listbox">
              {filtered.length === 0 ? (
                <p
                  className={cn(
                    'py-8 text-center text-sm',
                    theme === 'dark' ? 'text-white/30' : 'text-gray-400'
                  )}
                >
                  No results found
                </p>
              ) : (
                filtered.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        index === selected
                          ? theme === 'dark'
                            ? 'bg-brand-500/15 text-white'
                            : 'bg-brand-50 text-brand-700'
                          : theme === 'dark'
                            ? 'text-white/70 hover:bg-white/[0.04]'
                            : 'text-gray-600 hover:bg-gray-50'
                      )}
                      role="option"
                      aria-selected={index === selected}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg',
                          index === selected ? 'bg-brand-500/20' : 'bg-white/[0.05]'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.description && (
                          <p
                            className={cn(
                              'text-xs',
                              theme === 'dark' ? 'text-white/30' : 'text-gray-400'
                            )}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 opacity-30" aria-hidden="true" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div
              className={cn(
                'flex items-center justify-end gap-3 border-t px-4 py-2.5',
                theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'
              )}
            >
              {[
                { key: '↑↓', label: 'Navigate' },
                { key: '↵', label: 'Select' },
                { key: 'Esc', label: 'Close' },
              ].map(({ key, label }) => (
                <span
                  key={key}
                  className={cn(
                    'flex items-center gap-1 text-[11px]',
                    theme === 'dark' ? 'text-white/25' : 'text-gray-400'
                  )}
                >
                  <kbd
                    className={cn(
                      'rounded px-1 py-0.5 text-[10px] font-medium',
                      theme === 'dark' ? 'bg-white/[0.07] text-white/40' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {key}
                  </kbd>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(CommandPalette);
