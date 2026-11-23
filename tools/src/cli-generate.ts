import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateIconsDirectory } from './validator.js';
import { loadAndProcessIcons } from './svg-processor.js';
import { generateIconsPackage } from './generators/icons-generator.js';
import { generateIconsVuePackage } from './generators/icons-vue-generator.js';
import { generateIconsStaticPackage } from './generators/icons-static-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const iconsDir = path.join(rootDir, 'icons');
const schemaPath = path.join(rootDir, 'tools', 'icon-meta.schema.json');

const validation = validateIconsDirectory(iconsDir, schemaPath);
if (!validation.valid) {
  console.error(`Icon validation failed with ${validation.issues.length} issue(s):\n`);
  for (const issue of validation.issues) {
    console.error(`  [${issue.icon}/${issue.file}] ${issue.message}`);
  }
  process.exit(1);
}

const processed = loadAndProcessIcons(iconsDir);

generateIconsPackage(processed, path.join(rootDir, 'packages', 'icons'));
generateIconsVuePackage(processed, path.join(rootDir, 'packages', 'icons-vue'));
generateIconsStaticPackage(processed, path.join(rootDir, 'packages', 'icons-static'));

console.log(`Generated code for ${processed.length} icon(s) (${processed.length * 2} variants).`);
