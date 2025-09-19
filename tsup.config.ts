import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false, // Disable dts generation for now to avoid type issues
  bundle: true,
  minify: true,
  target: 'es2020',
  platform: 'node',
  external: [
    'express',
    'cors',
    'dotenv',
    '@google/generative-ai',
    'openai',
    'body-parser',
    'node:url',
    'node:path'
  ],
  esbuildOptions(options) {
    options.banner = {
      js: 'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);',
    };
  },
  onSuccess: 'tsc --project server/tsconfig.json --emitDeclarationOnly',
});
