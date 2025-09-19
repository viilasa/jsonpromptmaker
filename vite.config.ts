import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { UserConfig } from 'vite';

// https://vitejs.dev/config/
const config: UserConfig = {
  base: '/',  // Ensure base is set to root
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  css: {
    postcss: require('./postcss.config.js')
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    outDir: 'dist/client',
    target: 'es2020',
    assetsDir: 'assets',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
};

export default defineConfig(config);
