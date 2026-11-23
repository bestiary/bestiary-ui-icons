// @vitest-environment node
import path from 'node:path';
import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';

describe('Tree-shaking verification', () => {
  it('bundles only the imported icon from @bestiary-ui/icons', async () => {
    const entry = path.resolve(__dirname, '../packages/icons/dist/esm/index.js');
    const result = await build({
      stdin: {
        contents: `import { HomeOutline } from ${JSON.stringify(entry)}; console.log(HomeOutline);`,
        resolveDir: path.resolve(__dirname, '..'),
        loader: 'js',
      },
      bundle: true,
      write: false,
      format: 'esm',
      treeShaking: true,
    });

    const code = result.outputFiles[0]!.text;
    expect(code).toContain('home-outline');
    expect(code).not.toContain('arrow-right-solid');
    expect(code).not.toContain('search-solid');
  });

  it('bundles only the imported icon component from @bestiary-ui/icons-vue', async () => {
    const entry = path.resolve(__dirname, '../packages/icons-vue/dist/esm/index.js');
    const result = await build({
      stdin: {
        contents: `import { HomeOutline } from ${JSON.stringify(entry)}; console.log(HomeOutline);`,
        resolveDir: path.resolve(__dirname, '..'),
        loader: 'js',
      },
      bundle: true,
      write: false,
      format: 'esm',
      treeShaking: true,
      external: ['vue'],
    });

    const code = result.outputFiles[0]!.text;
    expect(code).toContain('home-outline');
    expect(code).not.toContain('arrow-right-solid');
    expect(code).not.toContain('search-solid');
  });
});
