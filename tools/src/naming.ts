import type { IconVariant } from './types.js';

export function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function variantExportName(kebab: string, variant: IconVariant): string {
  return `${toPascalCase(kebab)}${variant === 'outline' ? 'Outline' : 'Solid'}`;
}

export function variantKebabName(kebab: string, variant: IconVariant): string {
  return `${kebab}-${variant}`;
}
