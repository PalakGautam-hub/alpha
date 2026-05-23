import { Star } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/utils';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

function RatingStars({ rating, max = 5, size = 'sm', showValue = false }: RatingStarsProps) {
  const stars = Array.from({ length: max }, (_, i) => {
    const filled = i < Math.floor(rating);
    const partial = !filled && i < rating;
    return { filled, partial };
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((star, i) => (
          <Star
            key={i}
            className={cn(
              'fill-current',
              size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
              star.filled
                ? 'text-amber-400'
                : star.partial
                  ? 'text-amber-400/50'
                  : 'text-white/10'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {showValue && (
        <span
          className={cn(
            'font-medium tabular-nums text-white/60',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default memo(RatingStars);
