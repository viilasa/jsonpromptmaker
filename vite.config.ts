import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { UserConfig } from 'vite';

// https://vitejs.dev/config/
const config: UserConfig = {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs')
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
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
};

export default defineConfig(config);
