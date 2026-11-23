import type { IconNode, IconVariant } from '@bestiary-ui/icons';

export interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  defaultClass?: string;
}

export interface BaseIconProps extends IconProps {
  iconNode: IconNode;
  variant?: IconVariant;
  name?: string;
}

export interface DynamicIconProps extends IconProps {
  name: string;
}
