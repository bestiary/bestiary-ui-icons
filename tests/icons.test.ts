import { describe, expect, it } from 'vitest';
import {
  HomeOutline,
  HomeSolid,
  HouseOutline,
  createElement,
  createIcons,
  icons,
} from '../packages/icons/src/index.js';

describe('@bestiary-ui/icons (Vanilla JS)', () => {
  it('createElement renders outline SVG with base and variant classes', () => {
    const svg = createElement(HomeOutline, { class: 'custom-class', 'aria-hidden': 'true' });

    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(svg.getAttribute('stroke-linecap')).toBe('round');
    expect(svg.getAttribute('stroke-linejoin')).toBe('round');
    expect(svg.getAttribute('class')).toBe('bicon bicon-home-outline custom-class');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.children.length).toBeGreaterThan(0);
  });

  it('createElement renders solid SVG without stroke attributes even if strokeWidth is passed', () => {
    const svg = createElement(HomeSolid, { 'stroke-width': 4, strokeWidth: 4, stroke: 'red' });

    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.getAttribute('stroke')).toBe('none');
    expect(svg.getAttribute('stroke-width')).toBeNull();
    expect(svg.getAttribute('strokeWidth')).toBeNull();
    expect(svg.getAttribute('class')).toBe('bicon bicon-home-solid');
  });

  it('exports alias references identically', () => {
    expect(HouseOutline).toBe(HomeOutline);
    expect(icons['house-outline']).toBe(HomeOutline);
  });

  it('createIcons replaces data-bicon placeholders and preserves attributes/classes', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <i data-bicon="home-outline" class="nav-icon" data-test="123"></i>
      <span data-bicon="home-solid" aria-label="Home"></span>
    `;

    createIcons({
      icons,
      attrs: { width: 20, height: 20, class: 'global-icon' },
      root: container,
    });

    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);

    const first = svgs[0]!;
    expect(first.getAttribute('width')).toBe('20');
    expect(first.getAttribute('height')).toBe('20');
    expect(first.getAttribute('data-test')).toBe('123');
    expect(first.getAttribute('data-bicon')).toBeNull();
    expect(first.classList.contains('bicon')).toBe(true);
    expect(first.classList.contains('bicon-home-outline')).toBe(true);
    expect(first.classList.contains('global-icon')).toBe(true);
    expect(first.classList.contains('nav-icon')).toBe(true);

    const second = svgs[1]!;
    expect(second.getAttribute('aria-label')).toBe('Home');
    expect(second.getAttribute('fill')).toBe('currentColor');
    expect(second.getAttribute('stroke')).toBe('none');
  });
});
