import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { PluginOption } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Initialize plugins array with react
  const plugins: PluginOption[] = [react()];
  
  // Only import and use lovable-tagger in development
  if (mode === "development") {
    try {
      // Use dynamic import for ESM module
      const { componentTagger } = await import("lovable-tagger");
      const taggerPlugin = componentTagger() as PluginOption;
      if (taggerPlugin) {
        plugins.push(taggerPlugin);
      }
    } catch (err) {
      console.warn("Could not load lovable-tagger:", err);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Add this to handle ESM packages
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
  };
});
