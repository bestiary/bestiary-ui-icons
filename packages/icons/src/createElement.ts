import { getDefaultSvgAttributes } from './defaultAttributes.js';
import type { IconNode, SVGAttributes } from './types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const STROKE_ATTRS = new Set([
  'stroke',
  'stroke-width',
  'strokeWidth',
  'stroke-linecap',
  'strokeLinecap',
  'stroke-linejoin',
  'strokeLinejoin',
]);

function mergeClasses(...inputs: Array<string | number | boolean | undefined>): string {
  const seen = new Set<string>();
  for (const input of inputs) {
    if (typeof input !== 'string') continue;
    for (const cls of input.split(/\s+/)) {
      if (cls) seen.add(cls);
    }
  }
  return Array.from(seen).join(' ');
}

export function createElement(iconNode: IconNode, attrs: SVGAttributes = {}): SVGSVGElement {
  if (typeof document === 'undefined') {
    throw new Error('@bestiary-ui/icons: createElement requires a DOM environment.');
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  const defaults = getDefaultSvgAttributes(iconNode.variant);

  const combinedAttrs: Record<string, string> = { ...defaults };

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false || key === 'class') {
      continue;
    }
    if (iconNode.variant === 'solid' && STROKE_ATTRS.has(key)) {
      continue;
    }
    combinedAttrs[key] = value === true ? '' : String(value);
  }

  const iconClass = iconNode.name ? `bicon-${iconNode.name}` : undefined;
  const className = mergeClasses('bicon', iconClass, attrs.class);
  if (className) {
    combinedAttrs.class = className;
  }

  for (const [key, value] of Object.entries(combinedAttrs)) {
    svg.setAttribute(key, value);
  }

  for (const [tag, childAttrs] of iconNode.children) {
    const child = document.createElementNS(SVG_NS, tag);
    for (const [attrKey, attrVal] of Object.entries(childAttrs)) {
      child.setAttribute(attrKey, attrVal);
    }
    svg.appendChild(child);
  }

  return svg;
}
