import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, UserPreferences, ColumnVisibility, Product } from '@/types';

// ─── Theme Store ──────────────────────────────────────────────────────────────

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'omega-theme' }
  )
);

// ─── Preferences Store ────────────────────────────────────────────────────────

const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  thumbnail: true,
  title: true,
  category: true,
  brand: true,
  price: true,
  stock: true,
  rating: true,
  discountPercentage: true,
};

const DEFAULT_COLUMN_ORDER = [
  'thumbnail',
  'title',
  'category',
  'brand',
  'price',
  'stock',
  'rating',
  'discountPercentage',
];

interface PreferencesStore {
  preferences: UserPreferences;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setColumnVisibility: (visibility: ColumnVisibility) => void;
  setColumnOrder: (order: string[]) => void;
  setPageSize: (size: number) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  columnVisibility: DEFAULT_COLUMN_VISIBILITY,
  columnOrder: DEFAULT_COLUMN_ORDER,
  pageSize: 10,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      setSidebarCollapsed: (collapsed) =>
        set((state) => ({
          preferences: { ...state.preferences, sidebarCollapsed: collapsed },
        })),
      setColumnVisibility: (visibility) =>
        set((state) => ({
          preferences: { ...state.preferences, columnVisibility: visibility },
        })),
      setColumnOrder: (order) =>
        set((state) => ({
          preferences: { ...state.preferences, columnOrder: order },
        })),
      setPageSize: (size) =>
        set((state) => ({
          preferences: { ...state.preferences, pageSize: size },
        })),
      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    { name: 'omega-preferences' }
  )
);

// ─── Sidebar Store ────────────────────────────────────────────────────────────

interface SidebarStore {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  toggleMobile: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}));

// ─── Cart Store ───────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.product.id === product.id);
          if (existingIndex > -1) {
            const nextItems = [...state.items];
            const nextQty = nextItems[existingIndex].quantity + quantity;
            nextItems[existingIndex] = {
              ...nextItems[existingIndex],
              quantity: Math.min(nextQty, product.stock),
            };
            return { items: nextItems };
          }
          return {
            items: [...state.items, { product, quantity: Math.min(quantity, product.stock) }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
              : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price;
          const discount = item.product.discountPercentage || 0;
          const discountedPrice = price * (1 - discount / 100);
          return total + discountedPrice * item.quantity;
        }, 0);
      },
    }),
    { name: 'omega-cart' }
  )
);

// ─── Orders Store ─────────────────────────────────────────────────────────────

export type OrderStatus = 'Processing' | 'Shipped' | 'In Transit' | 'Delivered';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  status: OrderStatus;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),
      clearOrders: () => set({ orders: [] }),
    }),
    { name: 'omega-orders' }
  )
);
