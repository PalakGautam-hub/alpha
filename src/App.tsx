import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes';
import { useThemeStore } from '@/store';
import CommandPalette from '@/components/ui/CommandPalette';

export default function App() {
  const { theme } = useThemeStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-surface-900 text-white'
            : 'bg-gray-50 text-gray-900'
        }`}
      >
        <AppRoutes />
        <CommandPalette />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: theme === 'dark' ? '#16161f' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#111118',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
