// Product types matching dummyjson.com API
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoryResponse {
  slug: string;
  name: string;
  url: string;
}

// Filter & Sort types
export type SortField = 'price' | 'rating' | 'title' | 'stock';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilters {
  search: string;
  categories: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
  minRating: number;
}

// Analytics types
export interface AnalyticsData {
  totalProducts: number;
  averageRating: number;
  totalInventoryValue: number;
  categoryCount: number;
  categoryDistribution: CategoryData[];
  stockByCategory: StockData[];
  priceByCategory: PriceData[];
}

export interface CategoryData {
  name: string;
  count: number;
  value: number;
}

export interface StockData {
  category: string;
  stock: number;
  products: number;
}

export interface PriceData {
  category: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

// UI types
export type Theme = 'light' | 'dark';

export interface ColumnVisibility {
  [key: string]: boolean;
}

export interface UserPreferences {
  theme: Theme;
  sidebarCollapsed: boolean;
  columnVisibility: ColumnVisibility;
  columnOrder: string[];
  pageSize: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
