import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import { parseSync, type INode } from 'svgson';
import type { IconMeta, IconVariant, ValidationIssue, ValidationResult } from './types.js';

export const ALLOWED_PRIMITIVES = new Set([
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'ellipse',
]);

export const FORBIDDEN_ATTRIBUTES = new Set(['id', 'class', 'style']);

export const ALLOWED_COLOR_VALUES = new Set(['none', 'currentColor']);

const OUTLINE_REQUIRED_ATTRS: Record<string, string> = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

const SOLID_REQUIRED_ATTRS: Record<string, string> = {
  fill: 'currentColor',
  stroke: 'none',
};

function checkElementAttributes(
  node: INode,
  iconName: string,
  fileName: string,
  issues: ValidationIssue[],
): void {
  for (const [attr, value] of Object.entries(node.attributes)) {
    const lowerAttr = attr.toLowerCase();
    if (FORBIDDEN_ATTRIBUTES.has(lowerAttr) || lowerAttr.startsWith('on')) {
      issues.push({
        icon: iconName,
        file: fileName,
        message: `Forbidden attribute "${attr}" on <${node.name}>.`,
      });
    }

    if ((lowerAttr === 'fill' || lowerAttr === 'stroke') && !ALLOWED_COLOR_VALUES.has(value)) {
      issues.push({
        icon: iconName,
        file: fileName,
        message: `Hardcoded color "${attr}=${value}" on <${node.name}>. Only "currentColor" or "none" is allowed.`,
      });
    }
  }
}

function validateChildNodes(
  children: INode[],
  iconName: string,
  fileName: string,
  issues: ValidationIssue[],
): void {
  for (const child of children) {
    if (child.type !== 'element') {
      continue;
    }

    if (!ALLOWED_PRIMITIVES.has(child.name)) {
      issues.push({
        icon: iconName,
        file: fileName,
        message: `Forbidden SVG element <${child.name}>. Allowed primitives: ${Array.from(ALLOWED_PRIMITIVES).join(', ')}.`,
      });
    }

    checkElementAttributes(child, iconName, fileName, issues);

    if (child.children.length > 0) {
      validateChildNodes(child.children, iconName, fileName, issues);
    }
  }
}

export function validateSvgContent(
  svgContent: string,
  variant: IconVariant,
  iconName: string,
  fileName = `${variant}.svg`,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!svgContent.trim()) {
    issues.push({ icon: iconName, file: fileName, message: 'SVG file is empty.' });
    return issues;
  }

  let root: INode;
  try {
    root = parseSync(svgContent);
  } catch (err) {
    issues.push({
      icon: iconName,
      file: fileName,
      message: `Invalid SVG/XML syntax: ${(err as Error).message}`,
    });
    return issues;
  }

  if (root.name !== 'svg') {
    issues.push({
      icon: iconName,
      file: fileName,
      message: `Root element must be <svg>, found <${root.name}>.`,
    });
    return issues;
  }

  if (root.attributes.viewBox !== '0 0 24 24') {
    issues.push({
      icon: iconName,
      file: fileName,
      message: `Root <svg> must have viewBox="0 0 24 24", found "${root.attributes.viewBox ?? 'none'}".`,
    });
  }

  if ('width' in root.attributes || 'height' in root.attributes) {
    issues.push({
      icon: iconName,
      file: fileName,
      message: 'Root <svg> must not have hardcoded width or height attributes.',
    });
  }

  checkElementAttributes(root, iconName, fileName, issues);

  const requiredAttrs = variant === 'outline' ? OUTLINE_REQUIRED_ATTRS : SOLID_REQUIRED_ATTRS;
  for (const [key, expected] of Object.entries(requiredAttrs)) {
    const actual = root.attributes[key];
    if (actual !== expected) {
      issues.push({
        icon: iconName,
        file: fileName,
        message: `For ${variant} variant, root <svg> must have ${key}="${expected}", found "${actual ?? 'missing'}".`,
      });
    }
  }

  const elementChildren = root.children.filter((c) => c.type === 'element');
  if (elementChildren.length === 0) {
    issues.push({
      icon: iconName,
      file: fileName,
      message: 'SVG must contain at least one primitive child element.',
    });
  } else {
    validateChildNodes(elementChildren, iconName, fileName, issues);
  }

  return issues;
}

export function createMetaValidator(schemaPath: string) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8')) as object;
  const ajv = new Ajv({ allErrors: true });
  return ajv.compile<IconMeta>(schema);
}

export function validateIconsDirectory(iconsDir: string, schemaPath: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(iconsDir)) {
    return {
      valid: false,
      iconCount: 0,
      issues: [{ icon: '<root>', file: iconsDir, message: 'icons/ directory does not exist.' }],
    };
  }

  const validateMeta = createMetaValidator(schemaPath);
  const entries = fs
    .readdirSync(iconsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const seenIdentifiers = new Map<string, string>(); // identifier -> source icon folder

  for (const folderName of entries) {
    const iconPath = path.join(iconsDir, folderName);
    const outlinePath = path.join(iconPath, 'outline.svg');
    const solidPath = path.join(iconPath, 'solid.svg');
    const metaPath = path.join(iconPath, 'meta.json');

    if (!fs.existsSync(outlinePath)) {
      issues.push({ icon: folderName, file: 'outline.svg', message: 'Missing outline.svg.' });
    } else {
      const outlineContent = fs.readFileSync(outlinePath, 'utf-8');
      issues.push(...validateSvgContent(outlineContent, 'outline', folderName, 'outline.svg'));
    }

    if (!fs.existsSync(solidPath)) {
      issues.push({ icon: folderName, file: 'solid.svg', message: 'Missing solid.svg.' });
    } else {
      const solidContent = fs.readFileSync(solidPath, 'utf-8');
      issues.push(...validateSvgContent(solidContent, 'solid', folderName, 'solid.svg'));
    }

    if (!fs.existsSync(metaPath)) {
      issues.push({ icon: folderName, file: 'meta.json', message: 'Missing meta.json.' });
      continue;
    }

    let meta: IconMeta;
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as IconMeta;
    } catch (err) {
      issues.push({
        icon: folderName,
        file: 'meta.json',
        message: `Invalid JSON: ${(err as Error).message}`,
      });
      continue;
    }

    const validSchema = validateMeta(meta);
    if (!validSchema) {
      for (const err of validateMeta.errors ?? []) {
        issues.push({
          icon: folderName,
          file: 'meta.json',
          message: `Schema error at ${err.instancePath || '/'}: ${err.message ?? 'invalid'}`,
        });
      }
      continue;
    }

    if (meta.name !== folderName) {
      issues.push({
        icon: folderName,
        file: 'meta.json',
        message: `meta.name ("${meta.name}") must match directory name ("${folderName}").`,
      });
    }

    const identifiers = [meta.name, ...(meta.aliases ?? [])];
    for (const id of identifiers) {
      const existing = seenIdentifiers.get(id);
      if (existing !== undefined) {
        issues.push({
          icon: folderName,
          file: 'meta.json',
          message: `Duplicate icon name/alias "${id}" (already claimed by "${existing}").`,
        });
      } else {
        seenIdentifiers.set(id, folderName);
      }
    }
  }

  return {
    valid: issues.length === 0,
    iconCount: entries.length,
    issues,
  };
}
