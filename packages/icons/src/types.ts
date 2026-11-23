export type IconVariant = 'outline' | 'solid';

export type IconNodeTuple = [tag: string, attrs: Record<string, string>];

export interface IconNode {
  name?: string;
  variant: IconVariant;
  children: IconNodeTuple[];
}

export type SVGAttributes = Record<string, string | number | boolean | undefined>;

export interface CreateIconsOptions {
  icons: Record<string, IconNode>;
  attrs?: SVGAttributes;
  nameAttr?: string;
  root?: Document | Element;
}
