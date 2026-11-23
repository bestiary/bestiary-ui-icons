<script setup lang="ts">
import { computed, ref } from 'vue';
import { icons, type IconNode } from '@bestiary-ui/icons';
import { Icon } from '@bestiary-ui/icons-vue';

const search = ref('');
const size = ref(32);
const strokeWidth = ref(2);
const absoluteStrokeWidth = ref(false);
const color = ref('#38bdf8');
const theme = ref<'light' | 'dark'>('dark');
const variantFilter = ref<'both' | 'outline' | 'solid'>('both');

interface IconPair {
  baseName: string;
  outline?: IconNode;
  solid?: IconNode;
}

const iconPairs = computed<IconPair[]>(() => {
  const map = new Map<string, IconPair>();

  for (const [key, node] of Object.entries(icons)) {
    // Deduplicate aliases by checking node.name === key
    if (node.name !== key) continue;

    const baseName = key.replace(/-(outline|solid)$/, '');
    const existing = map.get(baseName) ?? { baseName };
    if (node.variant === 'outline') {
      existing.outline = node;
    } else {
      existing.solid = node;
    }
    map.set(baseName, existing);
  }

  const query = search.value.trim().toLowerCase();
  return Array.from(map.values())
    .filter((pair) => !query || pair.baseName.includes(query))
    .sort((a, b) => a.baseName.localeCompare(b.baseName));
});

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  color.value = theme.value === 'dark' ? '#e2e8f0' : '#0f172a';
}
</script>

<template>
  <div class="preview-root" :class="`theme-${theme}`">
    <header class="toolbar">
      <div class="brand">
        <h1>@bestiary-ui/icons</h1>
        <span class="count">{{ iconPairs.length }} icon(s)</span>
      </div>

      <div class="controls">
        <input
          v-model="search"
          type="search"
          placeholder="Filter icons..."
          class="control-input"
        />

        <label class="control-group">
          <span>Variant</span>
          <select v-model="variantFilter" class="control-select">
            <option value="both">Both</option>
            <option value="outline">Outline</option>
            <option value="solid">Solid</option>
          </select>
        </label>

        <label class="control-group">
          <span>Size: {{ size }}px</span>
          <input v-model.number="size" type="range" min="16" max="64" step="2" />
        </label>

        <label class="control-group">
          <span>Stroke: {{ strokeWidth }}</span>
          <input v-model.number="strokeWidth" type="range" min="1" max="3.5" step="0.25" />
        </label>

        <label class="control-checkbox">
          <input v-model="absoluteStrokeWidth" type="checkbox" />
          <span>absoluteStrokeWidth</span>
        </label>

        <label class="control-group">
          <span>Color</span>
          <input v-model="color" type="color" />
        </label>

        <button type="button" class="theme-btn" @click="toggleTheme">
          {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>
    </header>

    <main class="grid">
      <div v-for="pair in iconPairs" :key="pair.baseName" class="card">
        <div class="card-icons">
          <div v-if="(variantFilter === 'both' || variantFilter === 'outline') && pair.outline" class="variant-box">
            <Icon
              :icon-node="pair.outline"
              :size="size"
              :color="color"
              :stroke-width="strokeWidth"
              :absolute-stroke-width="absoluteStrokeWidth"
            />
            <span class="variant-label">outline</span>
          </div>

          <div v-if="(variantFilter === 'both' || variantFilter === 'solid') && pair.solid" class="variant-box">
            <Icon
              :icon-node="pair.solid"
              :size="size"
              :color="color"
              :stroke-width="strokeWidth"
              :absolute-stroke-width="absoluteStrokeWidth"
            />
            <span class="variant-label">solid</span>
          </div>
        </div>
        <div class="card-name">{{ pair.baseName }}</div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.preview-root {
  min-height: 100vh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.2s, color 0.2s;
}

.theme-dark {
  background-color: #0f172a;
  color: #f8fafc;
}

.theme-light {
  background-color: #f8fafc;
  color: #0f172a;
}

.toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(8px);
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.brand h1 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.count {
  font-size: 0.875rem;
  opacity: 0.7;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.control-input,
.control-select,
.theme-btn {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: transparent;
  color: inherit;
  font-size: 0.875rem;
}

.theme-btn {
  cursor: pointer;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
}

.control-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 18px 12px 12px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(148, 163, 184, 0.06);
}

.card-icons {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  min-height: 72px;
}

.variant-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.variant-label {
  font-size: 0.6875rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-name {
  margin-top: 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  opacity: 0.9;
}
</style>
