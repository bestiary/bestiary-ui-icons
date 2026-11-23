import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateIconsDirectory, validateSvgContent } from '../tools/src/validator.js';

const SCHEMA_PATH = path.resolve(__dirname, '../tools/icon-meta.schema.json');

describe('SVG & Icon Catalog Validator', () => {
  it('validates a compliant outline SVG', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`;
    expect(validateSvgContent(svg, 'outline', 'test-icon')).toEqual([]);
  });

  it('validates a compliant solid SVG', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>`;
    expect(validateSvgContent(svg, 'solid', 'test-icon')).toEqual([]);
  });

  it('rejects wrong viewBox and hardcoded width/height', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M0 0h16v16H0z"/></svg>`;
    const issues = validateSvgContent(svg, 'solid', 'bad-size');
    expect(issues.some((i) => i.message.includes('viewBox="0 0 24 24"'))).toBe(true);
    expect(issues.some((i) => i.message.includes('hardcoded width or height'))).toBe(true);
  });

  it('rejects forbidden tags (<script>, <style>, <text>, <g>)', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><script>alert(1)</script><g><path d="M0 0h1"/></g></svg>`;
    const issues = validateSvgContent(svg, 'solid', 'bad-tags');
    expect(issues.some((i) => i.message.includes('<script>'))).toBe(true);
    expect(issues.some((i) => i.message.includes('<g>'))).toBe(true);
  });

  it('rejects forbidden attributes (id, class, style) and hardcoded colors', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="oops"><path id="p1" style="fill:red" fill="#ff0000" d="M0 0h1"/></svg>`;
    const issues = validateSvgContent(svg, 'solid', 'bad-attrs');
    expect(issues.some((i) => i.message.includes('"class"'))).toBe(true);
    expect(issues.some((i) => i.message.includes('"id"'))).toBe(true);
    expect(issues.some((i) => i.message.includes('"style"'))).toBe(true);
    expect(issues.some((i) => i.message.includes('Hardcoded color'))).toBe(true);
  });

  it('rejects outline SVG missing required stroke attributes', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>`;
    const issues = validateSvgContent(svg, 'outline', 'bad-outline');
    expect(issues.some((i) => i.message.includes('stroke-width="2"'))).toBe(true);
    expect(issues.some((i) => i.message.includes('stroke-linecap="round"'))).toBe(true);
    expect(issues.some((i) => i.message.includes('stroke-linejoin="round"'))).toBe(true);
  });

  it('detects duplicate aliases across icons directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bicon-val-'));
    try {
      const outlineSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`;
      const solidSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 12h14"/></svg>`;

      for (const name of ['alpha', 'beta']) {
        const dir = path.join(tmpDir, name);
        fs.mkdirSync(dir);
        fs.writeFileSync(path.join(dir, 'outline.svg'), outlineSvg);
        fs.writeFileSync(path.join(dir, 'solid.svg'), solidSvg);
        fs.writeFileSync(
          path.join(dir, 'meta.json'),
          JSON.stringify({
            name,
            categories: ['general'],
            tags: ['test'],
            aliases: ['shared-alias'],
            deprecated: false,
          }),
        );
      }

      const result = validateIconsDirectory(tmpDir, SCHEMA_PATH);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.message.includes('Duplicate icon name/alias "shared-alias"'))).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
