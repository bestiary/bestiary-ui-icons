import type { IconVariant } from './types.js';

export const BASE_SVG_ATTRIBUTES: Record<string, string> = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
};

export const OUTLINE_ATTRIBUTES: Record<string, string> = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

export const SOLID_ATTRIBUTES: Record<string, string> = {
  fill: 'currentColor',
  stroke: 'none',
};

export function getDefaultSvgAttributes(variant: IconVariant): Record<string, string> {
  return {
    ...BASE_SVG_ATTRIBUTES,
    ...(variant === 'outline' ? OUTLINE_ATTRIBUTES : SOLID_ATTRIBUTES),
  };
}
