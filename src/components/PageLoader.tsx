import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

/** Full-page loading spinner for Suspense fallback */
export default function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600"
      >
        <Zap className="h-6 w-6 text-white" />
      </motion.div>
    </div>
  );
}
