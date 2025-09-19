import { defineConfig } from 'tsup';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Cross-platform way to ensure directory exists
function ensureDirSync(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export default defineConfig({
  entry: ['server/index.ts'],
  format: ['esm'],
  outDir: 'dist/server',
  outExtension: () => ({ js: '.js' }),
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
      // Ensure the dist/server directory exists
      ensureDirSync('dist/server');
      
      // Generate declarations in the dist/server directory
      const tscCmd = 'npx tsc --project server/tsconfig.json --emitDeclarationOnly';
      // @ts-ignore - shell can be boolean in newer Node.js versions
      execSync(tscCmd, { stdio: 'inherit', shell: true });
      
      console.log('Type declarations generated successfully');
    } catch (error) {
      console.error('Failed to generate type declarations:', error);
      process.exit(1);
    }
  },
});
