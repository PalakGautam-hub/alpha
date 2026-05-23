import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileDrawer from './MobileDrawer';
import { useSidebarStore } from '@/store';

export default function DashboardLayout() {
  const { isMobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-grid">
          <div className="mx-auto max-w-[1600px] p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
