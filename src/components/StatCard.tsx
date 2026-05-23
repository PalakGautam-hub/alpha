import { memo } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useThemeStore } from '@/store';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  gradient?: string;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, gradient, delay = 0 }: StatCardProps) {
  const { theme } = useThemeStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'glass-card relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        theme === 'dark' ? 'hover:shadow-black/30' : 'hover:shadow-gray-200/60'
      )}
    >
      {/* Gradient background accent */}
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl',
          gradient || 'bg-brand-500'
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'mb-1 text-xs font-medium uppercase tracking-widest',
              theme === 'dark' ? 'text-white/40' : 'text-gray-400'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'text-2xl font-bold tracking-tight',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                'mt-0.5 text-xs',
                theme === 'dark' ? 'text-white/30' : 'text-gray-400'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                  trend.positive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span
                className={cn('text-[11px]', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}
              >
                {trend.label}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
            gradient
              ? `bg-gradient-to-br ${gradient} opacity-90`
              : 'bg-brand-500/10'
          )}
        >
          <Icon
            className={cn('h-5 w-5', gradient ? 'text-white' : 'text-brand-400')}
            aria-hidden="true"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default memo(StatCard);
