import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useThemeStore } from '@/store';
import { cn } from '@/utils';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center"
    >
      <div className="text-gradient text-[120px] font-black leading-none tracking-tighter">
        404
      </div>
      <div>
        <h1
          className={cn(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}
        >
          Page not found
        </h1>
        <p className={cn('mt-2 text-sm', theme === 'dark' ? 'text-white/40' : 'text-gray-500')}>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors',
            theme === 'dark'
              ? 'border-white/[0.07] text-white/60 hover:text-white'
              : 'border-gray-200 text-gray-500 hover:text-gray-900'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </button>
      </div>
    </motion.div>
  );
}
