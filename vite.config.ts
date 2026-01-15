import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.DB_HOST': JSON.stringify(process.env.DB_HOST),
    'process.env.DB_USER': JSON.stringify(process.env.DB_USER),
    'process.env.DB_PASSWORD': JSON.stringify(process.env.DB_PASSWORD),
    'process.env.DB_NAME': JSON.stringify(process.env.DB_NAME),
    'process.env.DB_PORT': JSON.stringify(process.env.DB_PORT),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  }
});