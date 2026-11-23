export type IconVariant = 'outline' | 'solid';

export type IconNodeTuple = [tag: string, attrs: Record<string, string>];

export interface IconMeta {
  $schema?: string;
  name: string;
  categories: string[];
  tags?: string[];
  aliases?: string[];
  deprecated?: boolean;
  deprecationReason?: string;
}

export interface ParsedIconVariant {
  variant: IconVariant;
  rawSvg: string;
  optimizedSvg: string;
  children: IconNodeTuple[];
}

export interface ParsedIcon {
  name: string;
  pascalName: string;
  meta: IconMeta;
  outline: ParsedIconVariant;
  solid: ParsedIconVariant;
}

export interface ValidationIssue {
  icon: string;
  file: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  iconCount: number;
  issues: ValidationIssue[];
}
