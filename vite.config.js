import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Determine allowed hosts dynamically
// This supports local development and Replit's dynamic domain names
const allowedHosts = [
  'localhost',
  '.replit.dev',
  '.repl.co',
  '.repl.run',
  '.repl.it',
  '.picard.replit.dev'
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5000,
    host: '0.0.0.0',
    cors: true,
    strictPort: true,
    hmr: { 
      clientPort: 443,
      protocol: 'wss' 
    },
    watch: {
      ignored: ['**/node_modules/**']
    },
    fs: {
      allow: ['.'],
      strict: false
    },
    // Explicitly allow Replit domains
    allowedHosts: allowedHosts,
    proxy: {}
  },
  build: {
    outDir: 'build_output',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        format: 'cjs', // Use CommonJS format for compatibility with Electron
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});