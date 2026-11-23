import { defineComponent, h, type PropType } from 'vue';
import type { IconNode, IconVariant } from '@bestiary-ui/icons';

export const Icon = defineComponent({
  name: 'BestiaryIcon',
  inheritAttrs: false,
  props: {
    iconNode: {
      type: Object as PropType<IconNode>,
      required: true,
    },
    variant: {
      type: String as PropType<IconVariant>,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
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
    return () => {
      const effectiveVariant: IconVariant = props.variant ?? props.iconNode.variant;
      const iconName = props.name ?? props.iconNode.name;

      const variantAttrs: Record<string, string | number> =
        effectiveVariant === 'outline'
          ? {
              fill: 'none',
              stroke: props.color,
              'stroke-width': props.absoluteStrokeWidth
                ? (Number(props.strokeWidth) * 24) / Number(props.size)
                : props.strokeWidth,
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
            }
          : {
              fill: props.color,
              stroke: 'none',
            };

      // Filter out stroke-related attrs if someone passed them on a solid icon via $attrs
      const passThroughAttrs: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(attrs)) {
        if (key === 'class') continue;
        if (
          effectiveVariant === 'solid' &&
          (key === 'stroke' ||
            key === 'stroke-width' ||
            key === 'strokeWidth' ||
            key === 'stroke-linecap' ||
            key === 'strokeLinecap' ||
            key === 'stroke-linejoin' ||
            key === 'strokeLinejoin')
        ) {
          continue;
        }
        passThroughAttrs[key] = val;
      }

      const classes = [
        props.defaultClass,
        iconName ? `bicon-${iconName}` : null,
        attrs.class,
      ];

      const svgChildren = props.iconNode.children.map(([tag, childAttrs]) =>
        h(tag, childAttrs),
      );
      const slotContent = slots.default ? slots.default() : [];

      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: props.size,
          height: props.size,
          viewBox: '0 0 24 24',
          ...variantAttrs,
          ...passThroughAttrs,
          class: classes,
        },
        [...slotContent, ...svgChildren],
      );
    };
  },
});
