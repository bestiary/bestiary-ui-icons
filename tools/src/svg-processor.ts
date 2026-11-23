import fs from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';
import { parseSync, stringify, type INode } from 'svgson';
import { toPascalCase, variantKebabName } from './naming.js';
import type { IconMeta, IconNodeTuple, IconVariant, ParsedIcon, ParsedIconVariant } from './types.js';

function optimizeSvg(rawSvg: string, variant: IconVariant, iconName: string): {
  optimizedSvg: string;
  children: IconNodeTuple[];
  symbolSvg: string;
} {
  const result = optimize(rawSvg, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            removeUnknownsAndDefaults: {
              keepDataAttrs: false,
            },
          },
        },
      },
      'removeDimensions',
    ],
  });

  const parsed = parseSync(result.data);
  const children: IconNodeTuple[] = parsed.children
    .filter((child): child is INode => child.type === 'element')
    .map((child) => [child.name, child.attributes]);

  const kebabVariant = variantKebabName(iconName, variant);
  const baseAttrs: Record<string, string> =
    variant === 'outline'
      ? {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          class: `bicon bicon-${kebabVariant}`,
        }
      : {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          stroke: 'none',
          class: `bicon bicon-${kebabVariant}`,
        };

  const normalizedNode: INode = {
    name: 'svg',
    type: 'element',
    value: '',
    attributes: baseAttrs,
    children: parsed.children.filter((c) => c.type === 'element'),
  };

  const symbolAttrs: Record<string, string> =
    variant === 'outline'
      ? {
          id: `bicon-${kebabVariant}`,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }
      : {
          id: `bicon-${kebabVariant}`,
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          stroke: 'none',
        };

  const symbolNode: INode = {
    name: 'symbol',
    type: 'element',
    value: '',
    attributes: symbolAttrs,
    children: parsed.children.filter((c) => c.type === 'element'),
  };

  return {
    optimizedSvg: stringify(normalizedNode),
    children,
    symbolSvg: stringify(symbolNode),
  };
}

export interface ProcessedIcon extends ParsedIcon {
  outline: ParsedIconVariant & { symbolSvg: string };
  solid: ParsedIconVariant & { symbolSvg: string };
}

export function loadAndProcessIcons(iconsDir: string): ProcessedIcon[] {
  const entries = fs
    .readdirSync(iconsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const processed: ProcessedIcon[] = [];

  for (const folderName of entries) {
    const iconDir = path.join(iconsDir, folderName);
    const meta = JSON.parse(
      fs.readFileSync(path.join(iconDir, 'meta.json'), 'utf-8'),
    ) as IconMeta;
    const rawOutline = fs.readFileSync(path.join(iconDir, 'outline.svg'), 'utf-8');
    const rawSolid = fs.readFileSync(path.join(iconDir, 'solid.svg'), 'utf-8');

    const outlineOpt = optimizeSvg(rawOutline, 'outline', meta.name);
    const solidOpt = optimizeSvg(rawSolid, 'solid', meta.name);

    processed.push({
      name: meta.name,
      pascalName: toPascalCase(meta.name),
      meta,
      outline: {
        variant: 'outline',
        rawSvg: rawOutline,
        optimizedSvg: outlineOpt.optimizedSvg,
        children: outlineOpt.children,
        symbolSvg: outlineOpt.symbolSvg,
      },
      solid: {
        variant: 'solid',
        rawSvg: rawSolid,
        optimizedSvg: solidOpt.optimizedSvg,
        children: solidOpt.children,
        symbolSvg: solidOpt.symbolSvg,
      },
    });
  }

  return processed;
}
