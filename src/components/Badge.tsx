import { memo, ReactNode } from 'react';
import { useThemeStore } from '@/store';
import { cn } from '@/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANTS = {
  default: 'bg-white/[0.07] text-white/70',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  danger: 'bg-red-500/10 text-red-400',
  info: 'bg-blue-500/10 text-blue-400',
};

const LIGHT_VARIANTS = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
};

function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const { theme } = useThemeStore();
  const variants = theme === 'dark' ? VARIANTS : LIGHT_VARIANTS;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default memo(Badge);
