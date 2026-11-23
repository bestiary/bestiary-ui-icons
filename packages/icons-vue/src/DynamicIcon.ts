import { defineComponent, h, shallowRef, watch, type Component, type PropType } from 'vue';
import { dynamicIconImports } from './generated/dynamicIconImports.js';

export const DynamicIcon = defineComponent({
  name: 'DynamicIcon',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true,
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
    const loadedComponent = shallowRef<Component | null>(null);
    let requestId = 0;

    async function loadIcon(name: string) {
      const currentId = ++requestId;
      loadedComponent.value = null;

      const importer = dynamicIconImports[name];
      if (!importer) {
        return;
      }

      try {
        const mod = await importer();
        if (currentId === requestId) {
          loadedComponent.value = mod.default;
        }
      } catch {
        if (currentId === requestId) {
          loadedComponent.value = null;
        }
      }
    }

    watch(
      () => props.name,
      (newName) => {
        void loadIcon(newName);
      },
      { immediate: true },
    );

    return () => {
      if (!loadedComponent.value) {
        return slots.fallback ? slots.fallback() : slots.default ? slots.default() : null;
      }

      return h(
        loadedComponent.value,
        {
          ...attrs,
          size: props.size,
          color: props.color,
          strokeWidth: props.strokeWidth,
          absoluteStrokeWidth: props.absoluteStrokeWidth,
          defaultClass: props.defaultClass,
        },
        slots.default ? { default: slots.default } : undefined,
      );
    };
  },
});
