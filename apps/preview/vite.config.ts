import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@bestiary-ui\/icons\/icons\/(.+)$/,
        replacement: path.resolve(rootDir, 'packages/icons/src/generated/icons/$1.ts'),
      },
      {
        find: '@bestiary-ui/icons',
        replacement: path.resolve(rootDir, 'packages/icons/src/index.ts'),
      },
      {
        find: '@bestiary-ui/icons-vue',
        replacement: path.resolve(rootDir, 'packages/icons-vue/src/index.ts'),
      },
    ],
  },
});
