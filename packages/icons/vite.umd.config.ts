import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist/umd',
    emptyOutDir: false,
    sourcemap: true,
    minify: 'esbuild',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BestiaryIcons',
      formats: ['umd'],
      fileName: () => 'bestiary-icons.min.js',
    },
  },
});
