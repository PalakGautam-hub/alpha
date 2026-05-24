import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle,
  Tag,
  AlertCircle,
  Sparkles,
  ShoppingBag as ShoppingBagIcon,
  X,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore, useThemeStore, useOrderStore } from '@/store';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency, formatCategory, cn } from '@/utils';
import Badge from '@/components/ui/Badge';
import RatingStars from '@/components/ui/RatingStars';

// ─── Promo Codes Config ───────────────────────────────────────────────────────
const AVAILABLE_COUPONS: Record<string, number> = {
  OMEGA10: 0.1, // 10% off
  WELCOME20: 0.2, // 20% off
};

export default function CartPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout modal stepper state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1); // 1: Shipping, 2: Payment, 3: Success
  const [shippingForm, setShippingForm] = useState({
    name: 'Admin User',
    email: 'admin@omega.dev',
    address: '123 Tech Avenue',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvv: '123',
    cardName: 'ADMIN USER',
  });

  const [receiptId] = useState(() => `OM-${Math.floor(100000 + Math.random() * 900000)}`);

  // Fetch products to show recommendations
  const { products, isLoading: isProductsLoading } = useProducts();

  // Filter 3 products not already in the cart for cross-selling
  const recommendations = useMemo(() => {
    if (!products) return [];
    const cartIds = new Set(items.map((item) => item.product.id));
    return products
      .filter((p) => !cartIds.has(p.id) && p.stock > 0)
      .slice(0, 3);
  }, [products, items]);

  const handleAddRecommended = useCallback(
    (product: any) => {
      useCartStore.getState().addItem(product, 1);
      toast.success(`${product.title} added to cart!`, {
        icon: '🛒',
      });
    },
    []
  );

  // Cart quantity controls
  const handleIncrement = (productId: number, currentQty: number, stock: number) => {
    if (currentQty >= stock) {
      toast.error('Cannot exceed available stock limit.');
      return;
    }
    updateQuantity(productId, currentQty + 1);
  };

  const handleDecrement = (productId: number, currentQty: number) => {
    if (currentQty <= 1) {
      removeItem(productId);
      toast.success('Item removed from cart.');
      return;
    }
    updateQuantity(productId, currentQty - 1);
  };

  // Coupon calculations
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = couponCode.toUpperCase().trim();
    if (AVAILABLE_COUPONS[normalized] !== undefined) {
      setAppliedCoupon({ code: normalized, discount: AVAILABLE_COUPONS[normalized] });
      setCouponError('');
      toast.success(`Coupon "${normalized}" applied successfully!`, { icon: '🎉' });
    } else {
      setCouponError('Invalid coupon code. Try OMEGA10 or WELCOME20.');
      toast.error('Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed.');
  };

  // Pricing calculations
  const subtotal = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return subtotal * appliedCoupon.discount;
  }, [subtotal, appliedCoupon]);

  const finalSubtotal = subtotal - couponDiscountAmount;
  const shippingThreshold = 150;
  const shippingCost = finalSubtotal >= shippingThreshold || finalSubtotal === 0 ? 0 : 12;
  const taxRate = 0.085; // 8.5% CA Tax
  const taxCost = finalSubtotal * taxRate;
  const grandTotal = finalSubtotal + shippingCost + taxCost;

  // Checkout handlers
  const handleNextStep = () => {
    if (checkoutStep === 1) {
      if (!shippingForm.name || !shippingForm.email || !shippingForm.address || !shippingForm.city || !shippingForm.state || !shippingForm.zip) {
        toast.error('Please fill in all shipping fields.');
        return;
      }
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      if (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvv || !paymentForm.cardName) {
        toast.error('Please complete payment details.');
        return;
      }
      
      // Save order to store
      addOrder({
        id: receiptId,
        date: new Date().toISOString(),
        items: [...items],
        shippingAddress: { ...shippingForm },
        totals: {
          subtotal: subtotal,
          discount: couponDiscountAmount,
          shipping: shippingCost,
          tax: taxCost,
          total: grandTotal,
        },
        status: 'Processing',
      });

      // Trigger success checkout step
      setCheckoutStep(3);
      toast.success('Purchase complete! Thank you.', { icon: '🚀' });
    }
  };

  const handleCloseCheckout = () => {
    if (checkoutStep === 3) {
      // Clear cart on complete checkout
      clearCart();
      setAppliedCoupon(null);
      setCouponCode('');
    }
    setIsCheckoutOpen(false);
    setCheckoutStep(1);
  };

  // Prints/Downloads Invoice mockup
  const handlePrint = () => {
    toast.success('Invoice triggered for printing!');
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className={cn(
            'text-2xl font-bold tracking-tight md:text-3xl',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}
        >
          Shopping Cart
        </h1>
        <p className={cn('mt-0.5 text-sm', theme === 'dark' ? 'text-white/40' : 'text-gray-500')}>
          {items.length === 0
            ? 'Your cart is empty'
            : `You have ${items.reduce((sum, i) => sum + i.quantity, 0)} items in your cart`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          /* ─── Empty Cart State ─── */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm lg:p-20 border-dashed border-white/[0.08]"
          >
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/10 to-rose-500/10 shadow-lg shadow-brand-500/5">
              <ShoppingBagIcon className="h-9 w-9 text-brand-400" />
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute right-3 top-3 h-3 w-3 rounded-full bg-rose-500 shadow-md ring-2 ring-surface-900"
              />
            </div>
            <h2
              className={cn(
                'text-xl font-bold tracking-tight',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}
            >
              Your Cart is Empty
            </h2>
            <p className={cn('mx-auto mt-2 max-w-sm text-sm leading-relaxed', theme === 'dark' ? 'text-white/50' : 'text-gray-500')}>
              Explore our premium products catalog to add items to your cart, or search for recommended deals.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/30 active:translate-y-0"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          /* ─── Active Cart State ─── */
          <motion.div
            key="cart-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Left Col — Items List */}
            <div className="space-y-4 lg:col-span-2">
              <div
                className={cn(
                  'rounded-2xl border p-4 shadow-sm md:p-6',
                  theme === 'dark' ? 'border-white/[0.06] bg-surface-800' : 'border-gray-200 bg-white'
                )}
              >
                <div className="flex items-center justify-between border-b pb-4 border-white/[0.05]">
                  <h2 className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    Items List
                  </h2>
                  <button
                    onClick={() => {
                      clearCart();
                      toast.success('Cart cleared.');
                    }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  <AnimatePresence initial={false}>
                    {items.map(({ product, quantity }) => {
                      const discountPrice = product.price * (1 - product.discountPercentage / 100);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:gap-4 md:py-6"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Image */}
                            <div
                              onClick={() => navigate(`/products/${product.id}`)}
                              className={cn(
                                'relative h-16 w-16 cursor-pointer flex-shrink-0 overflow-hidden rounded-xl border transition-all hover:scale-105 md:h-20 md:w-20',
                                theme === 'dark' ? 'border-white/[0.07] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
                              )}
                            >
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="h-full w-full object-contain p-1"
                                loading="lazy"
                              />
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="info" size="sm">
                                  {formatCategory(product.category)}
                                </Badge>
                                {product.discountPercentage > 0 && (
                                  <Badge variant="success" size="sm">
                                    -{product.discountPercentage.toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                              <h3
                                onClick={() => navigate(`/products/${product.id}`)}
                                className={cn(
                                  'truncate text-sm font-semibold cursor-pointer hover:underline md:text-base',
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                )}
                              >
                                {product.title}
                              </h3>
                              <p className={cn('text-xs', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
                                by {product.brand || 'Omega'}
                              </p>
                            </div>
                          </div>

                          {/* Actions: Qty + Price */}
                          <div className="flex items-center justify-between gap-4 w-full sm:w-auto sm:justify-end md:gap-6">
                            {/* Qty Controls */}
                            <div
                              className={cn(
                                'flex items-center rounded-lg border px-1.5 py-1',
                                theme === 'dark' ? 'border-white/[0.07] bg-white/[0.02]' : 'border-gray-200 bg-white'
                              )}
                            >
                              <button
                                onClick={() => handleDecrement(product.id, quantity)}
                                className={cn(
                                  'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                                  theme === 'dark' ? 'hover:bg-white/[0.08]' : 'hover:bg-gray-100'
                                )}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span
                                className={cn(
                                  'w-8 text-center text-xs font-bold tabular-nums',
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                )}
                              >
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleIncrement(product.id, quantity, product.stock)}
                                className={cn(
                                  'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                                  theme === 'dark' ? 'hover:bg-white/[0.08]' : 'hover:bg-gray-100'
                                )}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p
                                className={cn(
                                  'text-sm font-bold tabular-nums',
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                )}
                              >
                                {formatCurrency(discountPrice * quantity)}
                              </p>
                              {product.discountPercentage > 0 && (
                                <p
                                  className={cn(
                                    'text-[10px] line-through tabular-nums',
                                    theme === 'dark' ? 'text-white/25' : 'text-gray-400'
                                  )}
                                >
                                  {formatCurrency(product.price * quantity)}
                                </p>
                              )}
                            </div>

                            {/* Trash button */}
                            <button
                              onClick={() => {
                                removeItem(product.id);
                                toast.success(`${product.title} removed from cart.`);
                              }}
                              className="p-1 text-white/30 transition-colors hover:text-red-400"
                              aria-label={`Remove ${product.title} from cart`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Upsell / Recommendations section */}
              {recommendations.length > 0 && (
                <div
                  className={cn(
                    'rounded-2xl border p-4 shadow-sm md:p-6',
                    theme === 'dark' ? 'border-white/[0.06] bg-surface-800' : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-brand-400 animate-pulse" />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>You might also like</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {recommendations.map((prod) => (
                      <div
                        key={prod.id}
                        className={cn(
                          'flex flex-row items-center gap-3 rounded-xl border p-3 transition-colors sm:flex-col sm:items-stretch sm:text-center',
                          theme === 'dark'
                            ? 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100/50'
                        )}
                      >
                        {/* Thumbnail */}
                        <div
                          onClick={() => navigate(`/products/${prod.id}`)}
                          className={cn(
                            'h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border sm:h-20 sm:w-full',
                            theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-200 bg-white'
                          )}
                        >
                          <img
                            src={prod.thumbnail}
                            alt=""
                            className="h-full w-full object-contain p-1"
                            loading="lazy"
                          />
                        </div>

                        {/* Title & Price */}
                        <div className="min-w-0 flex-1 sm:mt-1 sm:space-y-1">
                          <h4
                            onClick={() => navigate(`/products/${prod.id}`)}
                            className={cn(
                              'truncate text-xs font-semibold cursor-pointer hover:underline',
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            )}
                          >
                            {prod.title}
                          </h4>
                          <RatingStars rating={prod.rating} size="sm" />
                          <p
                            className={cn(
                              'text-xs font-bold tabular-nums',
                              theme === 'dark' ? 'text-white/80' : 'text-gray-800'
                            )}
                          >
                            {formatCurrency(prod.price * (1 - prod.discountPercentage / 100))}
                          </p>
                        </div>

                        {/* Quick Add */}
                        <button
                          onClick={() => handleAddRecommended(prod)}
                          className="rounded-lg bg-brand-500/10 px-2 py-1.5 text-2xs font-semibold text-brand-400 transition-colors hover:bg-brand-500 hover:text-white"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col — Order Summary */}
            <div className="space-y-4">
              <div
                className={cn(
                  'rounded-2xl border p-4 shadow-sm md:p-6',
                  theme === 'dark' ? 'border-white/[0.06] bg-surface-800' : 'border-gray-200 bg-white'
                )}
              >
                <h2
                  className={cn(
                    'mb-4 text-sm font-semibold border-b pb-3',
                    theme === 'dark' ? 'text-white border-white/[0.05]' : 'text-gray-900 border-gray-100'
                  )}
                >
                  Order Summary
                </h2>

                {/* Subtotal */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-white/50' : 'text-gray-500'}>Items Subtotal</span>
                    <span className={cn('font-medium tabular-nums', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Promo coupon details */}
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Coupon discount ({appliedCoupon.code})
                      </span>
                      <span className="font-semibold tabular-nums">-{formatCurrency(couponDiscountAmount)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-white/50' : 'text-gray-500'}>Shipping</span>
                    <span className={cn('font-medium tabular-nums', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400 font-semibold">Free Shipping</span>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-white/50' : 'text-gray-500'}>Estimated Tax (8.5%)</span>
                    <span className={cn('font-medium tabular-nums', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {formatCurrency(taxCost)}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <div
                      className={cn(
                        'rounded-lg border p-2 text-2xs leading-relaxed',
                        theme === 'dark'
                          ? 'border-brand-500/10 bg-brand-500/5 text-brand-400'
                          : 'border-brand-100 bg-brand-50 text-brand-600'
                      )}
                    >
                      💡 Add <strong>{formatCurrency(shippingThreshold - finalSubtotal)}</strong> more of items to qualify for <strong>FREE SHIPPING!</strong>
                    </div>
                  )}

                  <hr className={cn('my-4', theme === 'dark' ? 'border-white/[0.05]' : 'border-gray-100')} />

                  {/* Grand Total */}
                  <div className="flex justify-between text-base font-bold">
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Total Price</span>
                    <span className={cn('text-lg tabular-nums', theme === 'dark' ? 'text-brand-400' : 'text-brand-600')}>
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyCoupon} className="mt-5 space-y-2">
                  <label
                    htmlFor="promo-code"
                    className={cn('text-xs font-semibold', theme === 'dark' ? 'text-white/40' : 'text-gray-400')}
                  >
                    Have a promo coupon?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          id="promo-code"
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="e.g. OMEGA10"
                          className={cn(
                            'h-9 w-full rounded-lg border px-3 text-xs transition-colors',
                            theme === 'dark'
                              ? 'border-white/[0.07] bg-white/[0.03] text-white placeholder:text-white/20 focus:border-brand-500/50'
                              : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-brand-400'
                          )}
                          aria-label="Enter promo code"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-lg bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-400 hover:bg-brand-500 hover:text-white"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <Tag className="h-3 w-3" />
                        {appliedCoupon.code} ({(appliedCoupon.discount * 100).toFixed(0)}% OFF)
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-red-400 hover:text-red-300"
                        aria-label="Remove coupon"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-[11px] font-medium text-rose-400">{couponError}</p>}
                </form>

                {/* Checkout Button */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/30 active:translate-y-0"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Checkout Stepper Wizard Modal ─── */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseCheckout}
              aria-hidden="true"
            />

            {/* Stepper container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl transition-all',
                theme === 'dark' ? 'border border-white/[0.08] bg-surface-700' : 'border border-gray-200 bg-white'
              )}
              role="dialog"
              aria-modal="true"
              aria-label="Checkout Stepper Wizard"
            >
              {/* Stepper progress indicator header */}
              <div
                className={cn(
                  'flex items-center justify-between border-b px-5 py-4',
                  theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-rose-600">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <span className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                    Omega Checkout Flow
                  </span>
                </div>
                <button
                  onClick={handleCloseCheckout}
                  className="rounded p-1 transition-colors hover:bg-white/[0.08]"
                  aria-label="Close checkout"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Stepper Bar */}
              <div className="flex items-center justify-center gap-2 border-b border-white/[0.04] p-3 text-xs font-semibold">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5',
                    checkoutStep >= 1 ? 'bg-brand-500 text-white' : 'bg-white/[0.06] text-white/40'
                  )}
                >
                  1. Shipping
                </span>
                <span className="text-white/20">➔</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5',
                    checkoutStep >= 2 ? 'bg-brand-500 text-white' : 'bg-white/[0.06] text-white/40'
                  )}
                >
                  2. Payment
                </span>
                <span className="text-white/20">➔</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5',
                    checkoutStep === 3 ? 'bg-brand-500 text-white' : 'bg-white/[0.06] text-white/40'
                  )}
                >
                  3. Success
                </span>
              </div>

              {/* Body */}
              <div className="max-h-[70vh] overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  {checkoutStep === 1 && (
                    /* Step 1: Shipping Form */
                    <motion.div
                      key="step-shipping"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <h3 className={cn('text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                        Enter Shipping Address
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-white/50">Full Name</label>
                          <input
                            type="text"
                            value={shippingForm.name}
                            onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500"
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-white/50">Email Address</label>
                          <input
                            type="email"
                            value={shippingForm.email}
                            onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500"
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-white/50">Street Address</label>
                          <input
                            type="text"
                            value={shippingForm.address}
                            onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/50">City</label>
                          <input
                            type="text"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/50">State / ZIP</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={shippingForm.state}
                              onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                              placeholder="CA"
                              className="h-9 w-12 rounded-lg border px-2 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500 text-center"
                            />
                            <input
                              type="text"
                              value={shippingForm.zip}
                              onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                              placeholder="94107"
                              className="h-9 flex-1 rounded-lg border px-2 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {checkoutStep === 2 && (
                    /* Step 2: Payment Details */
                    <motion.div
                      key="step-payment"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <h3 className={cn('text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                        Simulated Credit Card details
                      </h3>
                      {/* Credit Card Mock graphic */}
                      <div className="rounded-xl bg-gradient-to-br from-brand-600 to-rose-700 p-4 text-white shadow-lg space-y-6">
                        <div className="flex justify-between items-center text-sm font-bold italic tracking-wide">
                          <span>OMEGA PLATINUM</span>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <p className="text-base tracking-widest font-mono tabular-nums">{paymentForm.cardNumber}</p>
                        <div className="flex justify-between items-center text-2xs font-mono">
                          <div>
                            <span className="block text-[8px] opacity-60 uppercase">Cardholder</span>
                            <span>{paymentForm.cardName}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] opacity-60 uppercase">Expiry</span>
                            <span>{paymentForm.expiry}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="col-span-3 space-y-1.5">
                          <label className="text-white/50">Cardholder Name</label>
                          <input
                            type="text"
                            value={paymentForm.cardName}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value.toUpperCase() })}
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500"
                          />
                        </div>
                        <div className="col-span-3 space-y-1.5">
                          <label className="text-white/50">Card Number</label>
                          <input
                            type="text"
                            value={paymentForm.cardNumber}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500"
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <label className="text-white/50">Expiration Date</label>
                          <input
                            type="text"
                            value={paymentForm.expiry}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                            placeholder="MM/YY"
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500 text-center"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-white/50">CVV / Pin</label>
                          <input
                            type="password"
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                            placeholder="123"
                            className="h-9 w-full rounded-lg border px-3 bg-white/[0.02] text-white border-white/[0.07] focus:border-brand-500 text-center"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {checkoutStep === 3 && (
                    /* Step 3: Success Confirmation Receipt */
                    <motion.div
                      key="step-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center py-4 space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      >
                        <CheckCircle className="h-14 w-14 text-emerald-400" />
                      </motion.div>

                      <div className="text-center">
                        <h3 className={cn('text-base font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                          Payment Successful!
                        </h3>
                        <p className="text-xs text-white/40 mt-1">Thank you for your order. Your receipt details are below.</p>
                      </div>

                      {/* Invoice paper graphic style */}
                      <div
                        className={cn(
                          'w-full rounded-xl border p-4 text-xs font-mono leading-relaxed space-y-3 shadow-md border-white/[0.06]',
                          theme === 'dark' ? 'bg-surface-800 text-white/90' : 'bg-gray-50 text-gray-800'
                        )}
                      >
                        <div className="flex justify-between font-bold border-b pb-2 border-dashed border-white/10">
                          <span>INVOICE #{receiptId}</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-1.5 pb-2 border-b border-dashed border-white/10">
                          <p className="font-semibold">Deliver to:</p>
                          <p>{shippingForm.name} — {shippingForm.email}</p>
                          <p>{shippingForm.address}, {shippingForm.city}, {shippingForm.state} {shippingForm.zip}</p>
                        </div>
                        <div className="space-y-2 pb-2 border-b border-dashed border-white/10">
                          <p className="font-semibold">Ordered Items:</p>
                          {items.map(({ product, quantity }) => (
                            <div key={product.id} className="flex justify-between text-2xs">
                              <span className="truncate max-w-[200px]">{product.title} (x{quantity})</span>
                              <span className="tabular-nums">
                                {formatCurrency(product.price * (1 - product.discountPercentage / 100) * quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1 text-right font-semibold tabular-nums text-xs">
                          {appliedCoupon && (
                            <p className="text-emerald-400">Coupon Discount: -{formatCurrency(couponDiscountAmount)}</p>
                          )}
                          {shippingCost > 0 && <p>Shipping: {formatCurrency(shippingCost)}</p>}
                          <p>Tax: {formatCurrency(taxCost)}</p>
                          <p className="text-sm font-bold pt-1 border-t border-white/10 text-brand-400">
                            Total Paid: {formatCurrency(grandTotal)}
                          </p>
                        </div>
                      </div>

                      {/* Receipt actions */}
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={handlePrint}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] py-2 text-xs font-semibold hover:bg-white/[0.06]"
                        >
                          <X className="hidden" /> {/* standard space spacer */}
                          <Printer className="h-3.5 w-3.5" />
                          Print Invoice
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons footer */}
              <div
                className={cn(
                  'flex items-center justify-between border-t px-5 py-4.5',
                  theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'
                )}
              >
                {checkoutStep < 3 ? (
                  <>
                    <button
                      onClick={() => {
                        if (checkoutStep === 2) setCheckoutStep(1);
                        else handleCloseCheckout();
                      }}
                      className={cn(
                        'rounded-lg border px-4 py-2 text-xs font-semibold transition-colors',
                        theme === 'dark'
                          ? 'border-white/[0.07] text-white/60 hover:bg-white/[0.04]'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {checkoutStep === 2 ? 'Back to Shipping' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:shadow-brand-500/25 transition-transform active:scale-95"
                    >
                      {checkoutStep === 1 ? (
                        <>
                          Continue to Payment
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Complete Purchase
                          <CheckCircle className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCloseCheckout}
                    className="w-full rounded-lg bg-brand-500 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-brand-600"
                  >
                    Done & Return
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
