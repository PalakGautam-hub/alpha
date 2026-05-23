import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Bell,
  Zap,
} from 'lucide-react';
import { useThemeStore, usePreferencesStore } from '@/store';
import { cn } from '@/utils';

const COLUMN_LABELS: Record<string, string> = {
  thumbnail: 'Image',
  title: 'Product Name',
  category: 'Category',
  brand: 'Brand',
  price: 'Price',
  stock: 'Stock',
  rating: 'Rating',
  discountPercentage: 'Discount',
};

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { preferences, setColumnVisibility, setPageSize, resetPreferences } = usePreferencesStore();

  const handleSave = () => {
    toast.success('Preferences saved!', { icon: '✅' });
  };

  const handleReset = () => {
    resetPreferences();
    toast.success('Preferences reset to defaults');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Header */}
      <div>
        <h1
          className={cn(
            'text-2xl font-bold tracking-tight',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}
        >
          Settings
        </h1>
        <p className={cn('mt-1 text-sm', theme === 'dark' ? 'text-white/40' : 'text-gray-500')}>
          Customize your Omega Dashboard experience
        </p>
      </div>

      {/* Appearance */}
      <div className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-brand-400" />
          <h2 className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Appearance
          </h2>
        </div>

        <div>
          <p className={cn('mb-3 text-xs', theme === 'dark' ? 'text-white/40' : 'text-gray-400')}>
            Theme
          </p>
          <div className="flex gap-3">
            {[
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'light', label: 'Light', icon: Sun },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value as 'dark' | 'light')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all',
                  theme === value
                    ? 'border-brand-500/40 bg-brand-500/10 text-brand-400'
                    : theme === 'dark'
                      ? 'border-white/[0.07] text-white/50 hover:border-white/[0.12] hover:text-white'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-700'
                )}
                aria-pressed={theme === value}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table preferences */}
      <div className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-emerald-400" />
          <h2 className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Table Columns
          </h2>
        </div>

        <p className={cn('text-xs', theme === 'dark' ? 'text-white/40' : 'text-gray-400')}>
          Choose which columns are visible in the Products table
        </p>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(preferences.columnVisibility).map(([id, visible]) => (
            <button
              key={id}
              onClick={() => {
                const next = { ...preferences.columnVisibility, [id]: !visible };
                setColumnVisibility(next);
              }}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all',
                visible
                  ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                  : theme === 'dark'
                    ? 'border-white/[0.06] text-white/30 hover:border-white/[0.1]'
                    : 'border-gray-100 text-gray-300 hover:border-gray-200'
              )}
              aria-pressed={visible}
            >
              <span>{COLUMN_LABELS[id] || id}</span>
              {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Page size */}
      <div className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <h2 className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Pagination
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className={cn('text-sm', theme === 'dark' ? 'text-white/50' : 'text-gray-500')}>
            Items per page
          </span>
          <div className="flex gap-2">
            {[10, 20, 50].map((size) => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={cn(
                  'flex h-8 w-12 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  preferences.pageSize === size
                    ? 'bg-brand-500 text-white'
                    : theme === 'dark'
                      ? 'border border-white/[0.07] text-white/50 hover:text-white'
                      : 'border border-gray-200 text-gray-400 hover:text-gray-900'
                )}
                aria-pressed={preferences.pageSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications (aesthetic only) */}
      <div className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-400" />
          <h2 className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
            Notifications
          </h2>
        </div>
        {['Product updates', 'Stock alerts', 'System notifications'].map((item) => (
          <div key={item} className="flex items-center justify-between">
            <span className={cn('text-sm', theme === 'dark' ? 'text-white/60' : 'text-gray-600')}>
              {item}
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-white/10 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-brand-500 peer-checked:after:translate-x-4 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500" />
            </label>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors',
            theme === 'dark'
              ? 'border-white/[0.07] text-white/50 hover:text-white'
              : 'border-gray-200 text-gray-500 hover:text-gray-900'
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Defaults
        </button>
        <button
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
      </div>
    </motion.div>
  );
}
