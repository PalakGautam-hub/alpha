import { memo } from 'react';
import type { VisibilityState } from '@tanstack/react-table';
import { cn } from '@/utils';

export const ColumnVisibilityPanel = memo(
  ({
    columnVisibility,
    onToggle,
    theme,
  }: {
    columnVisibility: VisibilityState;
    onToggle: (colId: string) => void;
    theme: string;
  }) => (
    <div
      className={cn(
        'absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border p-2 shadow-xl',
        theme === 'dark'
          ? 'border-white/[0.07] bg-surface-700'
          : 'border-gray-200 bg-white'
      )}
    >
      <p
        className={cn(
          'mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest',
          theme === 'dark' ? 'text-white/30' : 'text-gray-400'
        )}
      >
        Columns
      </p>
      {Object.entries(columnVisibility).map(([id, visible]) => (
        <label
          key={id}
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
            theme === 'dark' ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-50'
          )}
        >
          <input
            type="checkbox"
            checked={visible}
            onChange={() => onToggle(id)}
            className="accent-brand-500"
          />
          <span className={theme === 'dark' ? 'text-white/70' : 'text-gray-700'}>
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </span>
        </label>
      ))}
    </div>
  )
);
