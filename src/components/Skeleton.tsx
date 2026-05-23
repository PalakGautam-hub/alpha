import { cn } from '@/utils';
import { useThemeStore } from '@/store';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  const { theme } = useThemeStore();
  return (
    <div
      className={cn(
        'skeleton rounded-lg',
        theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.04]',
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 8 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 ${i === 0 ? 'w-10 rounded-lg' : 'w-full'}`} />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-5">
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
