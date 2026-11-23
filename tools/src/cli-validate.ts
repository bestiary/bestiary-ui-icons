import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateIconsDirectory } from './validator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const iconsDir = path.join(rootDir, 'icons');
const schemaPath = path.join(rootDir, 'tools', 'icon-meta.schema.json');

const result = validateIconsDirectory(iconsDir, schemaPath);

if (!result.valid) {
  console.error(`Icon validation failed with ${result.issues.length} issue(s):\n`);
  for (const issue of result.issues) {
    console.error(`  [${issue.icon}/${issue.file}] ${issue.message}`);
  }
  process.exit(1);
}

console.log(`Validated ${result.iconCount} icon(s) successfully.`);
