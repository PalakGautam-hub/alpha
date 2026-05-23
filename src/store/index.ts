import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, UserPreferences, ColumnVisibility } from '@/types';

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
