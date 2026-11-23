import { defineComponent, h, type PropType } from 'vue';
import type { IconNode } from '@bestiary-ui/icons';
import { Icon } from './Icon.js';

export function createVueIcon(displayName: string, iconNode: IconNode) {
  return defineComponent({
    name: displayName,
    inheritAttrs: false,
    props: {
      size: {
        type: [Number, String] as PropType<number | string>,
        default: 24,
      },
      color: {
        type: String,
        default: 'currentColor',
      },
      strokeWidth: {
        type: [Number, String] as PropType<number | string>,
        default: 2,
      },
      absoluteStrokeWidth: {
        type: Boolean,
        default: false,
      },
      defaultClass: {
        type: String,
        default: 'bicon',
      },
    },
    setup(props, { attrs, slots }) {
      return () =>
        h(
          Icon,
          {
            ...attrs,
            iconNode,
            size: props.size,
            color: props.color,
            strokeWidth: props.strokeWidth,
            absoluteStrokeWidth: props.absoluteStrokeWidth,
            defaultClass: props.defaultClass,
          },
          slots,
        );
    },
  });
}
