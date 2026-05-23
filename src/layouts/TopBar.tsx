import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Bell, Command } from 'lucide-react';
import { useThemeStore, useSidebarStore } from '@/store';
import { cn } from '@/utils';

function TopBar() {
  const { theme, toggleTheme } = useThemeStore();
  const { toggleMobile } = useSidebarStore();
  const navigate = useNavigate();
  const [hasNotification] = useState(true);

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <header
      className={cn(
        'flex h-16 items-center gap-3 border-b px-4 md:px-6',
        theme === 'dark'
          ? 'border-white/[0.06] bg-surface-800/80 backdrop-blur-md'
          : 'border-black/[0.06] bg-white/80 backdrop-blur-md'
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg transition-colors lg:hidden',
          theme === 'dark'
            ? 'text-white/60 hover:bg-white/[0.06] hover:text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        )}
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar / Command palette trigger */}
      <button
        onClick={openCommandPalette}
        className={cn(
          'flex flex-1 items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-all md:max-w-xs',
          theme === 'dark'
            ? 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/[0.12] hover:bg-white/[0.05]'
            : 'border-black/[0.07] bg-black/[0.03] text-gray-400 hover:border-black/[0.12] hover:bg-black/[0.05]'
        )}
        aria-label="Open command palette (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex-1 text-left">Search or jump to…</span>
        <span
          className={cn(
            'hidden items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium sm:flex',
            theme === 'dark'
              ? 'bg-white/[0.06] text-white/30'
              : 'bg-black/[0.06] text-gray-400'
          )}
        >
          <Command className="h-2.5 w-2.5" />K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            theme === 'dark'
              ? 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          )}
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {hasNotification && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            theme === 'dark'
              ? 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          )}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate('/settings')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-rose-600 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
          aria-label="User profile"
        >
          A
        </button>
      </div>
    </header>
  );
}

export default memo(TopBar);
