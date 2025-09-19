import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { PluginOption, ConfigEnv, UserConfigExport } from 'vite';

// https://vitejs.dev/config/
// Wrap the config in a function that returns a promise
const config = async ({ mode }: ConfigEnv) => {
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
  
  // Production-specific configuration
  const isProduction = mode === 'production';
  if (isProduction) {
    process.env.NODE_ENV = 'production';
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    css: {
      postcss: {
        config: path.resolve(__dirname, 'postcss.config.cjs')
      }
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
};

// Export the config wrapped in defineConfig
export default defineConfig(config as unknown as UserConfigExport);
