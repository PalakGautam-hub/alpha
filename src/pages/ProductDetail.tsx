import { useState, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  AlertCircle,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useProduct } from '@/hooks/useProduct';
import { useThemeStore } from '@/store';
import { formatCurrency, formatCategory, getStockStatus, cn } from '@/utils';
import Badge from '@/components/ui/Badge';
import RatingStars from '@/components/ui/RatingStars';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── Image Carousel ───────────────────────────────────────────────────────────

const ImageCarousel = memo(({ images, title }: { images: string[]; title: string }) => {
  const [current, setCurrent] = useState(0);
  const { theme } = useThemeStore();

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border',
          theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
        )}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`${title} — image ${current + 1}`}
            className="aspect-square w-full object-contain p-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/[0.1] bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/[0.1] bg-black/30 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === current ? 'w-4 bg-brand-400' : 'w-1.5 bg-white/30'
                  )}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                i === current
                  ? 'border-brand-500 opacity-100'
                  : theme === 'dark'
                    ? 'border-white/[0.06] opacity-50 hover:opacity-80'
                    : 'border-gray-200 opacity-50 hover:opacity-80'
              )}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Info row ─────────────────────────────────────────────────────────────────

const InfoRow = memo(
  ({
    label,
    value,
    theme,
  }: {
    label: string;
    value: React.ReactNode;
    theme: string;
  }) => (
    <div
      className={cn(
        'flex items-start justify-between border-b py-3',
        theme === 'dark' ? 'border-white/[0.05]' : 'border-gray-100'
      )}
    >
      <span className={cn('text-sm', theme === 'dark' ? 'text-white/40' : 'text-gray-400')}>
        {label}
      </span>
      <span
        className={cn(
          'text-right text-sm font-medium',
          theme === 'dark' ? 'text-white/80' : 'text-gray-900'
        )}
      >
        {value}
      </span>
    </div>
  )
);

// ─── Product Detail Page ──────────────────────────────────────────────────────

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { product, isLoading, error } = useProduct(id ? parseInt(id, 10) : null);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('Link copied to clipboard!');
    });
  }, []);

  const handleAddToCart = useCallback(() => {
    toast.success(`${product?.title} added to cart!`, {
      icon: '🛒',
    });
  }, [product]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`h-${i === 0 ? '8' : '4'} w-full`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className={cn('text-lg', theme === 'dark' ? 'text-white/60' : 'text-gray-500')}>
          {error || 'Product not found'}
        </p>
        <button
          onClick={() => navigate('/products')}
          className="rounded-lg bg-brand-500/10 px-5 py-2 text-sm text-brand-400 transition-colors hover:bg-brand-500/20"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const discountedPrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/products')}
        className={cn(
          'flex items-center gap-2 text-sm font-medium transition-colors',
          theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-900'
        )}
        aria-label="Back to products"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </button>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left — Image carousel */}
        <ImageCarousel images={product.images} title={product.title} />

        {/* Right — Product info */}
        <div className="space-y-5">
          {/* Header */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="info">{formatCategory(product.category)}</Badge>
              {product.brand && (
                <span className={cn('text-xs', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
                  by {product.brand}
                </span>
              )}
            </div>
            <h1
              className={cn(
                'text-2xl font-bold tracking-tight md:text-3xl',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}
            >
              {product.title}
            </h1>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-3">
              <RatingStars rating={product.rating} size="md" showValue />
              <span className={cn('text-xs', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div
            className={cn(
              'flex items-end gap-3 rounded-xl border p-4',
              theme === 'dark'
                ? 'border-white/[0.06] bg-white/[0.02]'
                : 'border-gray-100 bg-gray-50'
            )}
          >
            <span
              className={cn(
                'text-3xl font-bold tracking-tight',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}
            >
              {formatCurrency(discountedPrice)}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span
                  className={cn(
                    'mb-1 text-base line-through',
                    theme === 'dark' ? 'text-white/30' : 'text-gray-400'
                  )}
                >
                  {formatCurrency(product.price)}
                </span>
                <Badge variant="success" size="md">
                  -{product.discountPercentage.toFixed(0)}%
                </Badge>
              </>
            )}
          </div>

          {/* Description */}
          <p className={cn('text-sm leading-relaxed', theme === 'dark' ? 'text-white/60' : 'text-gray-600')}>
            {product.description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/30 active:translate-y-0"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <button
              onClick={handleShare}
              className={cn(
                'flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
                theme === 'dark'
                  ? 'border-white/[0.07] text-white/60 hover:border-white/[0.12] hover:text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'
              )}
              aria-label="Share product"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Details table */}
          <div
            className={cn(
              'rounded-xl border p-4',
              theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'
            )}
          >
            <h2
              className={cn(
                'mb-1 text-sm font-semibold',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}
            >
              Product Details
            </h2>
            <InfoRow
              label="Stock"
              value={
                <span className={stockStatus.color}>
                  {product.stock} units — {stockStatus.label}
                </span>
              }
              theme={theme}
            />
            <InfoRow label="SKU" value={product.sku} theme={theme} />
            <InfoRow label="Brand" value={product.brand || '—'} theme={theme} />
            <InfoRow
              label="Min. Order"
              value={`${product.minimumOrderQuantity} units`}
              theme={theme}
            />
            <InfoRow label="Warranty" value={product.warrantyInformation} theme={theme} />
            <InfoRow label="Shipping" value={product.shippingInformation} theme={theme} />
            <InfoRow label="Return Policy" value={product.returnPolicy} theme={theme} />
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h2
            className={cn(
              'mb-4 text-sm font-semibold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((review, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl border p-4',
                  theme === 'dark' ? 'border-white/[0.05] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      theme === 'dark' ? 'text-white/80' : 'text-gray-800'
                    )}
                  >
                    {review.reviewerName}
                  </span>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                <p
                  className={cn(
                    'text-xs leading-relaxed',
                    theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                  )}
                >
                  {review.comment}
                </p>
                <p
                  className={cn(
                    'mt-2 text-[11px]',
                    theme === 'dark' ? 'text-white/20' : 'text-gray-300'
                  )}
                >
                  {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ProductDetailPage;
