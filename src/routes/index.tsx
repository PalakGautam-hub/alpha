import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import PageLoader from '@/components/ui/PageLoader';

// Lazy-loaded pages for code splitting
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const ProductsPage = lazy(() => import('@/pages/Products'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
