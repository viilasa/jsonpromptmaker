import { defineConfig } from 'tsup';
import { execSync } from 'child_process';

export default defineConfig({
  entry: ['server/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false, // We'll generate declarations separately
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
    'node:path',
    'node:module'
  ],
  esbuildOptions(options) {
    options.banner = {
      js: 'import { createRequire } from \'node:module\'; const require = createRequire(import.meta.url);',
    };
  },
  async onSuccess() {
    try {
      console.log('Generating type declarations...');
      execSync('tsc --project server/tsconfig.json --emitDeclarationOnly --outDir dist', { stdio: 'inherit' });
      console.log('Type declarations generated successfully');
    } catch (error) {
      console.error('Failed to generate type declarations:', error);
      process.exit(1);
    }
  },
});
