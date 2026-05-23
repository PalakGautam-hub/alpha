import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'charts';
          if (id.includes('@tanstack')) return 'table';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor';
        },
      },
    },
  },
});
