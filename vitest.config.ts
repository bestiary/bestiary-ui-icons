import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@bestiary-ui\/icons\/icons\/(.+)$/,
        replacement: path.resolve(__dirname, 'packages/icons/src/generated/icons/$1.ts'),
      },
      {
        find: '@bestiary-ui/icons',
        replacement: path.resolve(__dirname, 'packages/icons/src/index.ts'),
      },
      {
        find: '@bestiary-ui/icons-vue',
        replacement: path.resolve(__dirname, 'packages/icons-vue/src/index.ts'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
