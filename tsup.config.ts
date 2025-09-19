import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  bundle: true,
  minify: true,
  target: 'es2020',
  platform: 'node',
  external: ['express', 'cors', 'dotenv', '@google/generative-ai', 'openai', 'body-parser'],
});
