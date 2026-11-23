import { describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import {
  DynamicIcon,
  HomeOutline,
  HomeSolid,
  HouseOutline,
  Icon,
} from '../packages/icons-vue/src/index.js';

describe('@bestiary-ui/icons-vue', () => {
  it('renders outline icon with default props and classes', () => {
    const wrapper = mount(HomeOutline);
    const svg = wrapper.find('svg');

    expect(svg.exists()).toBe(true);
    expect(svg.attributes('width')).toBe('24');
    expect(svg.attributes('height')).toBe('24');
    expect(svg.attributes('fill')).toBe('none');
    expect(svg.attributes('stroke')).toBe('currentColor');
    expect(svg.attributes('stroke-width')).toBe('2');
    expect(svg.classes()).toContain('bicon');
    expect(svg.classes()).toContain('bicon-home-outline');
  });

  it('supports size, color, strokeWidth, absoluteStrokeWidth, defaultClass, and a11y slot', () => {
    const wrapper = mount(HomeOutline, {
      props: {
        size: 48,
        color: '#ff00aa',
        strokeWidth: 2,
        absoluteStrokeWidth: true,
        defaultClass: 'custom-bicon',
      },
      attrs: {
        'aria-label': 'Home',
        class: 'extra-class',
      },
      slots: {
        default: '<title>Home Icon</title>',
      },
    });

    const svg = wrapper.find('svg');
    expect(svg.attributes('width')).toBe('48');
    expect(svg.attributes('height')).toBe('48');
    expect(svg.attributes('stroke')).toBe('#ff00aa');
    // (2 * 24) / 48 = 1
    expect(svg.attributes('stroke-width')).toBe('1');
    expect(svg.attributes('aria-label')).toBe('Home');
    expect(svg.classes()).toContain('custom-bicon');
    expect(svg.classes()).toContain('bicon-home-outline');
    expect(svg.classes()).toContain('extra-class');
    expect(svg.find('title').text()).toBe('Home Icon');
  });

  it('renders solid icon without stroke attributes even with strokeWidth and absoluteStrokeWidth', () => {
    const wrapper = mount(HomeSolid, {
      props: {
        size: 32,
        color: 'rebeccapurple',
        strokeWidth: 4,
        absoluteStrokeWidth: true,
      },
    });

    const svg = wrapper.find('svg');
    expect(svg.attributes('fill')).toBe('rebeccapurple');
    expect(svg.attributes('stroke')).toBe('none');
    expect(svg.attributes('stroke-width')).toBeUndefined();
    expect(svg.attributes('stroke-linecap')).toBeUndefined();
    expect(svg.attributes('stroke-linejoin')).toBeUndefined();
    expect(svg.classes()).toContain('bicon-home-solid');
  });

  it('supports aliases and base <Icon> component', () => {
    const aliasWrapper = mount(HouseOutline);
    expect(aliasWrapper.find('svg').classes()).toContain('bicon-home-outline');

    const baseWrapper = mount(Icon, {
      props: {
        iconNode: {
          variant: 'outline',
          children: [['circle', { cx: '12', cy: '12', r: '10' }]],
        },
        size: 16,
      },
    });
    expect(baseWrapper.find('circle').exists()).toBe(true);
    expect(baseWrapper.find('svg').attributes('width')).toBe('16');
  });

  it('DynamicIcon renders fallback and then resolves named icon asynchronously', async () => {
    const wrapper = mount(DynamicIcon, {
      props: {
        name: 'home-solid',
        size: 28,
      },
      slots: {
        fallback: '<span class="loading-fallback">Loading</span>',
      },
    });

    expect(wrapper.find('.loading-fallback').exists()).toBe(true);
    await flushPromises();

    const svg = wrapper.find('svg');
    expect(svg.exists()).toBe(true);
    expect(svg.attributes('width')).toBe('28');
    expect(svg.classes()).toContain('bicon-home-solid');
  });

  it('is SSR-compatible with vue/server-renderer', async () => {
    const app = createSSRApp({
      render() {
        return h('div', [h(HomeOutline, { size: 20 }), h(HomeSolid, { color: 'blue' })]);
      },
    });

    const html = await renderToString(app);
    expect(html).toContain('bicon-home-outline');
    expect(html).toContain('bicon-home-solid');
    expect(html).toContain('fill="blue"');
  });
});
