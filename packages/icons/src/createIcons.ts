import { createElement } from './createElement.js';
import type { CreateIconsOptions, SVGAttributes } from './types.js';

export function createIcons({
  icons,
  attrs = {},
  nameAttr = 'data-bicon',
  root,
}: CreateIconsOptions): void {
  const targetRoot = root ?? (typeof document !== 'undefined' ? document : undefined);
  if (!targetRoot) {
    throw new Error('@bestiary-ui/icons: createIcons requires a DOM environment or root element.');
  }

  const elements = Array.from(targetRoot.querySelectorAll(`[${nameAttr}]`));

  for (const element of elements) {
    const iconName = element.getAttribute(nameAttr);
    if (!iconName) continue;

    const iconNode = icons[iconName];
    if (!iconNode) {
      continue;
    }

    const elementAttrs: SVGAttributes = {};
    for (const attr of Array.from(element.attributes)) {
      if (attr.name === nameAttr) continue;
      elementAttrs[attr.name] = attr.value;
    }

    const mergedClass = [attrs.class, elementAttrs.class].filter(Boolean).join(' ');
    const mergedAttrs: SVGAttributes = {
      ...attrs,
      ...elementAttrs,
      ...(mergedClass ? { class: mergedClass } : {}),
    };

    const svg = createElement(iconNode, mergedAttrs);
    element.replaceWith(svg);
  }
}
